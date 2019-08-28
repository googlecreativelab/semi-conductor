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

export function hide(element) {
  element.style.display = 'none';
}

export function show(element, display) {
  display ? element.style.display = display : element.style.display = 'block';
}

export function constrain(value, constraints) {
  return Math.max(Math.min(value, constraints.max), constraints.min);
}

export function getDistance(a, b) {
  const distX = a.x - b.x;
  const distY = a.y - b.y;
  return Math.sqrt(distX**2 + distY**2);
}

export function getMidpoint(a, b) {
  const x1 = a.position.x;
  const x2 = b.position.x;
  return (x1 + x2) / 2;
}

export function average(items) {
  const total = items.reduce((prev, current) => { return prev + current });
  return total / items.length;
}

export function getAverageDifference(items) {
  let total = 0;
  for (let i = 0; i < items.length - 1; i++) {
    total += Math.abs(items[i] - items[i + 1]);
  }
  return total / (items.length - 1);
}

export function removeOneItemFromArray(array, item) {
  var index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
}

export function getDistanceFromOrigin(position) {
  return getDistance({ x:0, y:0 }, position);
}

export function getBeatLengthFromTempo(tempo, time) {
  let multiplier = 1000;
  if (time === 's') multiplier = 1;
  return (60 * 1 / tempo) * multiplier;
}

export function arrayWithLargestVariation(arrays) {
 const variations = arrays.map((array) => {
    return Math.max(...array) - Math.min(...array);
  });
  const arrayIndex = variations.indexOf(Math.max(...variations));
  return arrays[arrayIndex];
}

export function easeInOutQuart (x) {
  return t < .5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t;
}

export function getKeypoint(pose, part) {
  return pose.keypoints.filter((keypoint) => keypoint.part === part )[0];
}

/* Returns a dictionary where keys = name of keypoint, value = keypoint object */
export function getKeypoints(pose, parts) {
  const keypoints = {};
  if (parts) {
    parts.forEach((part) => {
      keypoints[part] = getKeypoint(pose, part);
    })
  } else {
    pose.keypoints.forEach((keypoint) => {
      keypoints[keypoint.part] = getKeypoint(pose, keypoint.part);
    });
  }
  return keypoints;
}

export function getPoseFromKeypoints(keypoints) {
  const pose = { keypoints: [] };
  Object.keys(keypoints).forEach((part) => {
    pose.keypoints.push(keypoints[part]);
  });
  return pose;
}