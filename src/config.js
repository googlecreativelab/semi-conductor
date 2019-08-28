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

export default {
  "paths": {
    "samplesPath": "/samples/",
    "texturesPath": "/textures/"
  },
  "display": {
    "height": 500,
    "width": 600,
    "color": "white",
    "lineWidth": 8,
    "pointRadius": 3,
    "maxTempoDisplay": 250,
    "roseInterval": 1800,
    "roseSpeed": 25
  },
  "tone": {
    "gain": 0.3,
    "reverb": 3,
    "jcReverbWet": 0.2,
    "reverbWet": 0.3
  },
  "smoothing": {
    "jumpDetection": false,
    "smoothing": 0.67,
    "maxJumpRatio": 0.4,
    "jumpResetTime": 500,
    "speedSmoothing": 0.8
  },
  "posenet": {
    "algorigthm": "multi-pose",
    "flipHorizontal": true,
    "mobileNetArchitecture": 0.75, // 1.01
    "outputStride": 16,
    "imageScaleFactor": 0.33, // 0.5
    "minPoseConfidence": 0.2,
    "minPartConfidence": 0.1
  },
  "detection": {
    "calibrationMargin": 50,
    "distanceMeasurementNumber": 5,
    "distanceMeasurementInterval": 50,
    "beatDistanceArmspanRatio": 0.4,
    "minimumBpm": 40,
    "maximumBpm": 200,
    "minimumDuration": 0.05,
    "maximumDuration": 6,
    "minimumVelocity": 0.1,
    "maximumVelocity": 1,
    "beatLengthStoppingIntervalRatio": 0.4,
    "stoppingDistanceArmspanRatio": 0.08
  },
  "zones": [
    {
      "start": 0,
      "end": 260,
      "instruments": ["violin", "string ensemble 1"]
    },
    {
      "start": 260,
      "end": 340,
      "instruments": ["violin", "string ensemble 1", "viola", "cello", "contrabass"]
    },
    {
      "start": 340,
      "end": 600,
      "instruments": ["viola", "cello", "contrabass"]
    }
  ]
}