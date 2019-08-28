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

// Import this or horrible, inexplicable errors happen ¯\_(ツ)_/¯ -- https://github.com/parcel-bundler/parcel/issues/1762
import 'babel-polyfill';

// Import modules
import Renderer from './renderer';
import AudioPlayer from './audio-player';
import PoseController from './pose-controller';

// Import json files
import config from '../config.js';
import song from '../assets/song.json';
import samples from '../assets/samples.json';

class App {
  constructor(config) {
    this.config = config;

    this.state = {
      loaded: false,
      percentageLoaded: 0,
      calibrating: true,
      conducting: false,
      stopped: false,
      finished: false,
      graphicsLoaded: false
    }

    this.renderer = new Renderer({
      state: this.state,
      songTitle: song.header.name,
      startCalibration: this.startCalibration.bind(this),
      restart: this.restart.bind(this),
      setGraphicsLoaded: this.setGraphicsLoaded.bind(this)
    });

    this.audioPlayer = new AudioPlayer({
      song: song,
      samples: samples,
      setInstrumentsLoaded: this.setInstrumentsLoaded.bind(this),
      setSongProgress: this.setSongProgress.bind(this),
      triggerAnimation: this.renderer.triggerAnimation.bind(this.renderer)
    });

    this.poseController = new PoseController({
      state: this.state,
      renderer: this.renderer,
      handleCalibration: this.handleCalibration.bind(this),
      setTempo: this.setTempo.bind(this),
      getBeatLength: this.audioPlayer.getBeatLength.bind(this.audioPlayer),
      setInstrumentGroup: this.audioPlayer.setInstrumentGroup.bind(this.audioPlayer),
      setVelocity: this.audioPlayer.setVelocity.bind(this.audioPlayer),
      stop: this.stop.bind(this),
      start: this.start.bind(this)
    });
  }

  /* Called with percentage each time instrument samples loaded */
  setInstrumentsLoaded(percentage) {
    this.state.percentageLoaded = percentage;
    this.setLoadProgress();
  }

  /* Called once when graphics loaded */
  setGraphicsLoaded() {
    this.state.graphicsLoaded = true;
    this.setLoadProgress();
  }

  /* Combines load progress of both graphics & samples
     to make sure app is fully loaded before starting */
  setLoadProgress() {
    let percentage;
    if (!this.state.graphicsLoaded) {
      percentage = this.state.percentageLoaded - 20;
    } else {
      percentage = this.state.percentageLoaded;
    }

    this.renderer.renderLoadProgress(percentage);
    if (percentage === 100) {
      this.state.loaded = true;
      this.audioPlayer.queueSong();
    }
  }

  setSongProgress(percentage) {
    this.renderer.renderSongProgress(percentage);
    if (percentage >= 99.9 && !this.state.finished) {
      this.state.finished = true;
      this.renderer.renderFinishPage();
    }
  }

  /* Called when tempo measurement made in PoseController */
  setTempo(tempo) {
    // Sanity check just in case.
    if (!(tempo > 0) || tempo == Infinity) return;
    this.renderer.renderTempo(tempo);
    this.audioPlayer.setTempo(tempo);
  }

  /* Called when resuming motion in PoseController */
  start() {
    this.state.stopped = false;
    this.audioPlayer.start()
  }

  /* Called when motion is stopped from PoseController */
  stop() {
    this.state.stopped = true;
    this.audioPlayer.stop();
  }

  /* Called when user clicks start button in renderer.js */
  async startCalibration() {
    if (!this.poseController.initialized) await this.poseController.initialize();
  }

  /* Called when calibration pose detected, handles transition to conducting */
  handleCalibration() {
    this.renderer.renderCalibrationSuccess();
    this.state.calibrating = false;

    setTimeout(() => {
      this.renderer.renderConductPage();
      setTimeout(async () => {
        await this.renderer.renderCountdown();
        this.state.conducting = true;
      }, 1000)
    }, 2000);
  }

  /* When the user clicks to restart the experience */
  restart() {
    this.audioPlayer.restart();
    this.state.calibrating = true;
    this.state.stopped = false;
    this.state.conducting = false;
    this.state.finished = false;
  }
}

const app = new App(config);