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
import { getKeypoint } from './helpers';
import { smoothNum } from './smoothing';
import * as posenet from '@tensorflow-models/posenet';
import { CONSTRAINT_IDENTIFIER_REGISTRY_SYMBOL_MAP } from '@tensorflow/tfjs-layers/dist/constraints';

export default class PosenetRenderer {
  constructor(props) {
    this.props = props;
    this.ctx = props.canvas.getContext('2d');
  }

  /* Draws a video frame + posenet lines onto the canvas */
  drawFrame(video, pose) {
    const ctx = this.ctx;
    const width = config.display.width;
    const height = config.display.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.scale(-1, 1); // Flip video, as it's front-facing
    ctx.translate(-width, 0);
    if (this.props.state.calibrating) ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();
    
    if (pose && pose.score > config.posenet.minPoseConfidence) {
      this.drawKeypoints(pose);
      this.drawSkeleton(pose);
      // this.drawFace(pose);
    }
  }

  /* Go through and draw all the joints */
  drawKeypoints(pose) {
    const minConfidence = config.posenet.minPartConfidence;

    pose.keypoints.forEach(keypoint => {
      if (keypoint.score > minConfidence) {
        this.drawPoint(keypoint.position);
      }
    });
  }

  drawSkeleton(pose) {
    const adjacentKeypoints = posenet.getAdjacentKeyPoints(
      pose.keypoints, 0 /* config.posenet.minPartConfidence*/);
    
    adjacentKeypoints.forEach((keypoints) => {
      this.drawSegment({
        start: keypoints[0].position,
        end: keypoints[1].position
      });
    });
  }

  drawFace(pose) {
    const ctx = this.ctx;
    const radius = smoothNum(0.6 *  Math.abs(getKeypoint(pose, 'nose').position.y - getKeypoint(pose, 'leftShoulder').position.y), 0.8);
    const nose = getKeypoint(pose, 'nose');

    // let parts = 80;
    // let step = Math.PI * 2 / parts;

    ctx.beginPath();
    ctx.arc(nose.position.x, nose.position.y, radius, 0, 2 * Math.PI);
    ctx.lineWidth = config.display.lineWidth;
    ctx.strokeStyle = config.display.color;
    ctx.stroke();
  }

  /* Draws a single circular point (for joints) */
  drawPoint(args) {
    const ctx = this.ctx;
    const radius = config.display.pointRadius;
    ctx.beginPath();
    ctx.arc(args.x, args.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = config.display.color;
    ctx.fill();
  }

  /* Draws a line (for limbs) */
  drawSegment(args) {
    // args = { start: { x, y }, end: { x, y }
    const ctx = this.ctx;

    ctx.moveTo(
      args.start.x,
      args.start.y
    );
    ctx.lineTo(
      args.end.x,
      args.end.y
    );

    ctx.lineWidth = config.display.lineWidth;
    ctx.strokeStyle = config.display.color;
    ctx.stroke();
  }
}