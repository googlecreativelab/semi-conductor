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

import { getKeypoint, getDistance, getKeypoints, getPoseFromKeypoints } from './helpers';
import config from '../config';

const smoothing = config.smoothing.smoothing;
let smoothPrevPose;

/* Prevent jumping, then smooth towards the average */
export function smooth(pose, armspan) {
  if (config.smoothing.jumpDetection) pose = unjump(pose, armspan);
  if (!smoothPrevPose) { smoothPrevPose = pose; return pose; }
  
  const keypoints = getKeypoints(pose);
  const prevKeypoints = getKeypoints(smoothPrevPose);
  const smoothKeypoints = keypoints;

  Object.keys(keypoints).forEach((part) => {
    const prevPos = prevKeypoints[part].position;
    const smoothPos = smoothKeypoints[part].position;
    const pos = keypoints[part].position;
    
    smoothPos.x = (prevPos.x - pos.x) * (smoothing) + pos.x;
    smoothPos.y = (prevPos.y - pos.y) * (smoothing) + pos.y;
  });

  const smoothPose = getPoseFromKeypoints(smoothKeypoints);
  smoothPose.score = pose.score;
  smoothPrevPose = smoothPose;
  return smoothPose;
}

/* If joints move too fast (they jump unrealistically) it's probably
   a glitch. So ignore those movements. */
let jumpPrevPose;
let jumpReset = [];
let jumpResetPose;
function unjump(pose, armspan) {
  if (!jumpPrevPose) {
    jumpPrevPose = pose;
    return pose;
  }

  // Maximum valid movement distance (smaller = more agressive smoothing)
  const maxDistance = config.smoothing.maxJumpRatio * armspan;
  const smoothedKeypoints = [];

  // Go over each keypoint, see if it's moved an unrealistic amount in one frame,
  // and if so revert to previous position
  pose.keypoints.forEach((keypoint) => {
    const prevKeypoint = getKeypoint(jumpPrevPose, keypoint.part);
    const distance = getDistance(keypoint.position, prevKeypoint.position);

    if (distance > maxDistance) {
      smoothedKeypoints.push(prevKeypoint);
    } else {
      smoothedKeypoints.push(keypoint);
    }
  });

  const originalPose = Object.assign({}, pose);
  pose.keypoints = smoothedKeypoints;

  // Reset any parts that have been stuck
  jumpReset.forEach((part) => {
    const prevKeypoint = getKeypoint(jumpPrevPose, part);
    pose.keypoints.forEach((keypoint) => {
      if (keypoint.part === part) {
        keypoint.position.x = getKeypoint(originalPose, part).position.x;
        keypoint.position.y = getKeypoint(originalPose, part).position.y;
      }
    });
    jumpReset.splice(jumpReset.indexOf(part), 1);
  });

  jumpPrevPose = pose;
  return pose;
}

/* Sometimes the joints get stuck (legitimate fast movements,
   or where joints get lost). Reset every x seconds in case of this. */
if (config.smoothing.jumpDetection) setUnjumpInterval();
function setUnjumpInterval() {
  setInterval(() => {
    const prevPose = jumpResetPose;
    const pose = jumpPrevPose;

    if (typeof prevPose != 'undefined' && prevPose.keypoints && typeof pose != 'undefined' && pose.keypoints) {
      pose.keypoints.forEach((keypoint) => {
        const prevKeypoint = getKeypoint(prevPose, keypoint.part)
        const distance = getDistance(keypoint.position, prevKeypoint.position);

        if (distance === 0) {
          jumpReset.push(keypoint.part);
        }
      });
    }

    jumpResetPose = Object.assign({}, jumpPrevPose);
  }, config.smoothing.jumpResetTime)
}

/* Smoothing for number values (tempo) */
let prevNum;
export function smoothNum(num, numSmoothing) {
  if (!prevNum) { prevNum = num; return num; }
  const finalNum = (prevNum - num) * (numSmoothing) + num;
  prevNum = finalNum;
  if (finalNum === num) console.log("DOINAOIN")
  return finalNum;
}