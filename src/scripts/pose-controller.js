/*
Copyright 2019 Google LLC

Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

import config from '../config';
import * as posenet from '@tensorflow-models/posenet';
import PosenetRenderer from './posenet-renderer';
import { smooth, smoothNum } from './smoothing';
import { getKeypoint, getKeypoints, getMidpoint, getDistance, getAverageDifference, getDistanceFromOrigin, arrayWithLargestVariation } from './helpers';

// FYI -- 'leftWrist' is actually your right wrist ¯\_(ツ)_/¯ 

export default class PoseController {
  constructor(props) {
    this.props = props;
    this.armspan = 400;
    this.isCalculatingSpeed = false;
    this.initialized = false;
    this.playedFirstNote = false;
    this.isEstimatingPose = false;
    this.stoppingTimeout = { timeout: null, pose: null };
  }

  /* Create the video/canvas objects and start the neural net */
  async initialize() {
    this.video = await this.props.renderer.loadVideo();
    if (!this.video) return;

    this.video.play();

    const canvas = this.props.renderer.setupVideoCanvas();
    this.posenetRenderer = new PosenetRenderer({
      state: this.props.state,
      canvas: canvas
    });

    this.net = await posenet.load(config.posenet.mobileNetArchitecture);
    this.initialized = true;

    this.loop();
  }

  /* Main pose detection loop */
  async loop() {
    if (this.isEstimatingPose) { requestAnimationFrame(this.loop.bind(this)); return };

    this.isEstimatingPose = true;
    this.pose = await this.getPose();
    this.isEstimatingPose = false;

    if (!this.pose) {
      this.props.setTempo(0);
    }

    if (this.pose && this.props.state.calibrating) {
      if (this.detectCalibrationPose()) this.handleCalibration();
    }

    if (this.pose && this.props.state.conducting) {
      this.detectTempo().then((tempo) => {
        if (this.playedFirstNote) this.props.setTempo(tempo);
      }).catch(() => { /* Ignore */ });

      this.props.setInstrumentGroup(this.getHandZone());
      this.props.setVelocity(this.getNormalisedHeight());
      this.setStoppingTimeout(); // Stop if hands not moving
    }

    this.posenetRenderer.drawFrame(this.video, this.pose);
    requestAnimationFrame(this.loop.bind(this));
  }

  /* Get pose from Posenet and apply smoothing */
  async getPose() {
    const posenetArgs = [
      this.video,
      config.posenet.imageScaleFactor,
      config.posenet.flipHorizontal,
      config.posenet.outputStride
    ];

    // Detect the pose
    let pose;
    if (config.posenet.algorithm === 'single-pose') {
      pose = await this.net.estimateSinglePose(...posenetArgs)
    } else {
      const poses = await this.net.estimateMultiplePoses(...posenetArgs);
      if (poses.length === 0) {
        return;
      }
      // Take the pose with the highest score
      // pose = poses.reduce((prev, current) => (prev.score >= current.score) ? prev : current);
      pose = poses[0];
    }

    if (pose.score >= config.posenet.minPoseConfidence) {
      this.poseVisible = true;
      return smooth(pose, this.armspan);
    } else {
      this.poseVisible = false;
      this.props.stop();
      return;
    }
  }

  /* Calibration detection methods */

  detectCalibrationPose() {
    const parts = getKeypoints(this.pose, [
      'leftWrist', 'rightWrist', 'leftElbow',
      'rightElbow', 'leftShoulder', 'rightShoulder'
    ]);
    const margin = config.detection.calibrationMargin;
    const maxDist = config.display.width;
    
    // Look for a T-shape pose, with hands in line with elbows and shoulders
    return (
      // this.handsVisible() &&
      (parts.leftWrist.position.y < parts.leftShoulder.position.y + margin) &&
      (parts.leftWrist.position.y > parts.leftShoulder.position.y - margin) &&
      (parts.rightWrist.position.y < parts.rightShoulder.position.y + margin) &&
      (parts.rightWrist.position.y > parts.rightShoulder.position.y - margin) &&
      (parts.leftWrist.position.y < parts.leftElbow.position.y + margin) &&
      (parts.leftWrist.position.y > parts.leftElbow.position.y - margin) &&
      (parts.rightWrist.position.y < parts.rightElbow.position.y + margin) &&
      (parts.rightWrist.position.y > parts.rightElbow.position.y - margin) && 
      (parts.leftWrist.position.x > 0) && (parts.leftWrist.position.x < maxDist) &&
      (parts.rightWrist.position.x > 0) && (parts.rightWrist.position.x < maxDist)
    );
  }

  handleCalibration() {
    this.armspan = this.getHandDistance();
    this.props.handleCalibration();
  }

  /* Tempo detection */
  async detectTempo() {
    if (this.isCalculatingSpeed) throw 'Waiting for calculation to complete.';
    this.isCalculatingSpeed = true;

    const num = config.detection.distanceMeasurementNumber;
    const interval = config.detection.distanceMeasurementInterval;

    // Get an array of each hand's distance from the origin at various intervals
    const distances = [[], []];
    for (let i = 0; i < num; i++) {
      setTimeout(() => {
        if (!this.pose) return;
        const leftHand = getKeypoint(this.pose, 'leftWrist');
        const rightHand = getKeypoint(this.pose, 'rightWrist');
        distances[0].push(getDistanceFromOrigin(leftHand.position));
        distances[1].push(getDistanceFromOrigin(rightHand.position));
      }, interval * i);
    }

    // After the above finishes, find the hand that moved the most,
    // and get bpm based on that hand's speed
    return new Promise((resolve) => {
      setTimeout((() => {
        const conductingHandDistances = arrayWithLargestVariation(distances);
        const speed = this.getBpmFromDistances(conductingHandDistances, interval);
        let bpm = smoothNum(speed, config.smoothing.speedSmoothing);
        bpm = Math.min(bpm, config.detection.maximumBpm);
        this.isCalculatingSpeed = false;
        resolve(bpm);
      }).bind(this), interval * num + 1)
    })
  }

  /* Stop music if hands not moving */
  setStoppingTimeout() {
    if (this.stoppingTimeout.timeout) return; // Already in progress
    const factor = config.detection.beatLengthStoppingIntervalRatio;
    const max = config.detection.stoppingDistanceArmspanRatio * this.armspan;
    const interval = this.props.getBeatLength() * factor;

    this.stoppingTimeout.timeout = setTimeout(() => {
      this.stoppingTimeout.timeout = null;
      // Get previous pose and this pose, return if no previous pose
      const lastPose = this.stoppingTimeout.pose;
      const thisPose = this.stoppingTimeout.pose = this.pose;
      if (!lastPose || !thisPose) return;

      // Calculate positions & difference between before & after interval
      const lastLeftWrist = getKeypoint(lastPose, 'leftWrist')
      const thisLeftWrist = getKeypoint(thisPose, 'leftWrist');
      const lastRightWrist = getKeypoint(lastPose, 'rightWrist');
      const thisRightWrist = getKeypoint(thisPose, 'rightWrist');
      const diff1 = getDistance(lastLeftWrist.position, thisLeftWrist.position);
      const diff2 = getDistance(lastRightWrist.position, thisRightWrist.position);

      // If difference is big enough, stop music
      if (diff1 < max && diff2 < max) {
        this.props.stop();
      } else {
        if (this.props.state.conducting && this.poseVisible) {
          this.playedFirstNote = true;
          this.props.start();
        }
      }
    }, interval);
  }

  /* Check if hands are reliably in scene */
  handsVisible() {
    const leftWrist = getKeypoint(this.pose, 'leftWrist');
    const rightWrist = getKeypoint(this.pose, 'rightWrist');
    
    return (
      leftWrist.score > config.posenet.minPartConfidence
      && rightWrist.score > config.posenet.minPartConfidence
    );
  }

  /* Gets distance between leftWrist and rightWrist keypoints at any one time */
  getHandDistance() {
    const leftWrist = getKeypoint(this.pose, 'leftWrist');
    const rightWrist = getKeypoint(this.pose, 'rightWrist');
    return getDistance(leftWrist.position, rightWrist.position);
  }

  /* Get a list of positions and interval between measurements, return bpm */
  getBpmFromDistances(distances, interval) {
    const avg = getAverageDifference(distances);
    const pxPerMs = avg / interval;
    const pxPerMinute = pxPerMs * 1000 * 60;
    const beatDistance = this.armspan * config.detection.beatDistanceArmspanRatio;
    const beatsPerMinute = pxPerMinute / beatDistance;
    return beatsPerMinute;
  }

  /* Check whether hands are to the left, right or center */
  getHandZone() {
    const leftWrist = getKeypoint(this.pose, 'leftWrist');
    const rightWrist = getKeypoint(this.pose, 'rightWrist');
    const midpoint = getMidpoint(leftWrist, rightWrist);
    const zones = config.zones;

    for (let i = 0; i < zones.length; i++) {
      if (zones[i].start < midpoint && midpoint < zones[i].end) return i;
    }
  }

  getNormalisedHeight() {
    const leftWrist = getKeypoint(this.pose, 'leftWrist');
    const rightWrist = getKeypoint(this.pose, 'rightWrist');
    const highestY = Math.min(leftWrist.position.y, rightWrist.position.y);
    const normalisedHeight = (1 - highestY / config.display.height);
    return normalisedHeight;
  }
}