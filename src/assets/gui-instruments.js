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
  violin: {
    animation: {
      triggered: false
    },
    objects: [
      { // Right bottom
        x0: 336,
        y0: 590,
        rotation0: 0.5 * Math.PI,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 0.5 * Math.PI
        }
      },
      { // Right middle
        x0: 356,
        y0: 535,
        rotation0: 0.6 * Math.PI,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 0.5 * Math.PI
        }
      },
      { // Right top
        x0: 381,
        y0: 478,
        rotation0: 0.65 * Math.PI,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 0.5 * Math.PI
        }
      },
      { // Left bottom
        x0: 160,
        y0: 590,
        rotation0: 0.5 * Math.PI,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 0.5 * Math.PI
        }
      },
      { // Left middle bottom
        x0: 179,
        y0: 521,
        rotation0: 1.75,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 0.5 * Math.PI
        }
      },
      { // Left middle top
        x0: 210,
        y0: 460,
        rotation0: 0.6 * Math.PI,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 0.5 * Math.PI
        }
      },
      { // Left top
        x0: 260,
        y0: 412,
        rotation0: 0.65 * Math.PI,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 0.5 * Math.PI
        }
      }
    ]
  },
  'string ensemble 1': {
    animation: {
      triggered: false
    },
    objects: [
      { // Bottom left
        x0: 484,
        y0: 403,
        rotation0: 2.27,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 0.5 * Math.PI
        }
      },
      { // Bottom center
        x0: 565,
        y0: 374,
        rotation0: 2.7,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 0.5 * Math.PI
        }
      },
      { // Bottom right
        x0: 640,
        y0: 361,
        rotation0: 3,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 0.5 * Math.PI
        }
      },
      { // Top left
        x0: 365,
        y0: 313,
        rotation0: 2.22,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 0.5 * Math.PI
        }
      },
      { // Top center left
        x0: 456,
        y0: 278,
        rotation0: 2.48,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 0.5 * Math.PI
        }
      },
      { // Top center right
        x0: 549,
        y0: 253,
        rotation0: 2.8,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 0.5 * Math.PI
        }
      },
      { // Top right
        x0: 633,
        y0: 242,
        rotation0: 3,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 0.5 * Math.PI
        }
      }
    ]
  },
  viola: {
    animation: {
      triggered: false
    },
    objects: [
      { // Bottom left
        x0: 771,
        y0: 370,
        rotation0: 4.1,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 4.7
        }
      },
      { // Bottom right
        x0: 888,
        y0: 378,
        rotation0: 4.1,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 4.7
        }
      },
      { // Top left
        x0: 771,
        y0: 250,
        rotation0: 4.1,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 4.7
        }
      },
      { // Top middle
        x0: 904,
        y0: 275,
        rotation0: 4.1,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 4.7
        }
      },
      { // Top right
        x0: 1021,
        y0: 318,
        rotation0: 4.1,
        bow: {
          x0: 2,
          y0: 17,
          rotation0: 4.7
        }
      }
    ]
  },
  cello: {
    animation: {
      triggered: false
    },
    objects: [
      { // Bottom
        x0: 1078,
        y0: 512,
        rotation0: 0,
        bow: {
          x0: 20,
          y0: 17,
          rotation0: 1.8
        }
      },
      { // Top
        x0: 970,
        y0: 458,
        rotation0: 0,
        bow: {
          x0: 20,
          y0: 17,
          rotation0: 1.8
        }
      }
    ]
  },
  contrabass: {
    animation: {
      triggered: false
    },
    objects: [
      { // Bottom
        x0: 1254,
        y0: 470,
        rotation0: 0,
        bow: {
          x0: 20,
          y0: 17,
          rotation0: 1.8
        }
      },
      { // Top
        x0: 1197,
        y0: 308,
        rotation0: 0,
        bow: {
          x0: 20,
          y0: 17,
          rotation0: 1.8
        }
      }
    ]
  }
}