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


import config from '../config.js';
import { hide, show, constrain } from './helpers';
import Orchestra from './orchestra';
import roseImageSrc from '../assets/rose.svg';
import applause from '../assets/applause.mp3';

export default class Renderer {
  constructor(props) {
    this.props = props;

    this.pages = {
      start: document.querySelector('.page-start'),
      tutorial: document.querySelector('.page-tutorial'),
      main: document.querySelector('.page-main'),
      info: document.querySelector('.page-info'),
      finish: document.querySelector('.page-finish'),
      error: document.querySelector('.page-error')
    };

    this.elems = {
      html: document.querySelector('html'),
      body: document.querySelector('body'),
      videoContainer: document.querySelector('.video-container'),
      videoBorder: document.querySelector('.video-border'),
      startButton: document.querySelector('.start-button'),
      restartButtons: document.querySelectorAll('.button-restart'),
      infoButton: document.querySelector('.button-info'),
      songTitle: document.querySelector('.song-title'),
      infoCloseButton: document.querySelector('.button-info-close'),
      tempo: document.querySelector('.tempo-meter'),
      calibrationOverlay: document.querySelector('.calibration-overlay'),
      calibrationOverlayImg: document.querySelector('.calibration-overlay img'),
      countdownOverlay: document.querySelector('.countdown-overlay'),
      countdownText: document.querySelector('.countdown-text'),
      songProgress: document.querySelector('.song-progress'),
      errorText: document.querySelector('.error-text'),
      conductingOverlay: document.querySelector('.conducting-overlay')
    }

    this.elems.songTitle.innerHTML = this.props.songTitle;
    this.prevTempo = null;
    this.tempo = null;
    this.isFinishPage = false;
    this.roses = [];
    this.rosePositions = [];
    this.applauseAudio = new Audio(applause);
    this.orchestra = new Orchestra({
      texturesPath: config.paths.texturesPath + 'spritesheet.json',
      loaded: this.props.setGraphicsLoaded
    });

    this.addStartHooks();
    this.checkMobile();
  }

  checkMobile() {
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      this.elems.html.classList.add('is-mobile');
      this.elems.body.classList.add('is-mobile');
      show(this.pages.error, 'flex');
      this.elems.errorText.innerHTML = `This experience works best in a
        desktop browser – your orchestra is waiting for you there.
      <br><br><a class="button button-large" href='mailto:?subject=${encodeURIComponent("Note to self: check out Semi-Conductor")}&body=${encodeURIComponent("Dear me, remember earlier today you were checking out that conducting experience? Here is the link for it: semiconductor.withgoogle.com")}'>Email a reminder</a>`;
    }
  }

  /* Add event listeners now that DOM has loaded */
  addStartHooks() {
    this.elems.startButton.addEventListener('click', () => {
      if (this.props.state.loaded) this.renderTutorialPage();
    })
    this.elems.restartButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.renderRestart();
      });
    })
    this.elems.infoButton.addEventListener('click', () => {
      show(this.pages.info, 'flex');
    });
    this.elems.infoCloseButton.addEventListener('click', () => {
      hide(this.pages.info)
    });
  }

  /* Updates the loading button on the start page */
  renderLoadProgress(progress) {
    // Progress is a value between 0 and 100
    this.elems.startButton.style.background = 'linear-gradient(to right, #ff8976 '
      + progress + '%, rgba(0,0,0,0) ' + progress + '%)';

    if (progress === 100) {
      // Make button active
      this.elems.startButton.innerHTML = "Start";
      this.elems.startButton.disabled = false;
    }
  }

  /* Updates the song progress bar */
  renderSongProgress(progress) {
    this.elems.songProgress.style.background = 'linear-gradient(to right, #ff8976 '
    + progress + '%, rgba(0,0,0,0) ' + progress + '%)';
  }

  renderFinishPage() {
    setTimeout(() => {
      show(this.pages.finish);
      this.pages.finish.classList.add('fade-in');
      this.isFinishPage = true;
      this.applauseAudio.play();
      this.renderFallingRoses();
    }, 1500);
  }

  /* Tutorial Page */

  renderTutorialPage() {
    hide(this.pages.start);
    show(this.pages.tutorial)
    show(document.querySelector('.tutorial-part-1'), 'flex');
    this.addTutorialHooks();
  }

  addTutorialHooks() {
    let tutorialStep = 1;

    // 'Next page' buttons
    document.querySelectorAll('.tutorial-next').forEach((button) => {
      button.addEventListener('click', () => {
        hide(document.querySelector('.tutorial-part-' + tutorialStep));
        tutorialStep++;
        show(document.querySelector('.tutorial-part-' + tutorialStep), 'flex');
      });
    });

    // 'Finish tutorial' button
    document.querySelector('.tutorial-end').addEventListener('click', () => {
      hide(this.pages.tutorial);

      this.props.startCalibration();
      this.renderCalibratePage();
    });
  }

  /* === CALIBRATE PAGE FUNCTIONS === */

  renderCalibratePage() {
    show(this.pages.main, 'flex');
  }

  renderTempo(tempo) {
    this.tempo = tempo;
  }

  startTempoAnimation() {

    if ((typeof this.tempo === 'number') && (typeof this.currentTempo === 'number')) {
      this.currentTempo = (this.tempo - this.currentTempo) * 0.1 + this.currentTempo;
      if (this.currentTempo > 200) {
        this.elems.tempo.classList.add('fast')
      } else {
        this.elems.tempo.classList.remove('fast')
      }

      const maxTempo = config.detection.maximumBpm;
      const tempoRatio = Math.min(maxTempo, this.currentTempo) / maxTempo;
      const rotation = constrain(Math.round(180 * tempoRatio) - 180, {
        min: 10 - 180,
        max: -20
      });
      this.elems.tempo.style.transform = 'rotateZ(' + rotation + 'deg)';
    }

    if ((typeof this.tempo === 'number') && !(typeof this.currentTempo === 'number')) {
      this.currentTempo = this.tempo;
    }

    requestAnimationFrame(this.startTempoAnimation.bind(this));
  }

  /* === CONDUCTING PAGE FUNCTIONS === */

  renderCalibrationSuccess() {
    this.elems.calibrationOverlay.classList.add('success');
    hide(this.elems.calibrationOverlayImg)
    document.querySelector('.instructions p').innerHTML = "👍";
    document.querySelector('.instructions p').style.transform = "scale(2)";
  }

  renderConductPage() {
    hide(this.elems.calibrationOverlay);
    show(this.elems.conductingOverlay);
    this.pages.main.classList.add('conducting-mode');
    this.startTempoAnimation();
  }

  triggerAnimation(instrument, duration, velocity) {
    this.orchestra.trigger(instrument, duration, velocity)
  }

  renderCountdown() {
    return new Promise((resolve) => {
      let i = 3;
      const interval = setInterval(() => {
        if (i > 0) this.renderCountdownNumber(i);
        if (i === 0) {
          clearInterval(interval);
          this.elems.countdownText.innerHTML = "";
          hide(this.elems.countdownOverlay);
          resolve();
        }
        i--;
      }, 1000)
    })
  }

  renderCountdownNumber(number) {
    this.elems.countdownText.innerHTML = number;
  }

  /* === VIDEO SETUP FUNCTIONS === */
  
  async loadVideo() {
    const elem = this.elems.videoContainer;

    // Set up video element
    const video = document.createElement('video');
    video.width = config.display.width;
    video.height = config.display.height;
    video.style.display = 'none';

    // Get stream of media from webcam
    let stream;
    try {
      stream = await this.getStream();
    } catch(e) {
      this.renderVideoError();
      return false;
    }

    video.srcObject = stream;
    
    // Add new video object to the DOM
    elem.appendChild(video);
    
    // Send promise to return video object once stream is loaded
    return new Promise((resolve) => {
      video.onloadedmetadata = () => { resolve (video) };
    });
  }

  setupVideoCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = config.display.width;
    canvas.height = config.display.height;
    this.elems.videoBorder.appendChild(canvas);
    return canvas;
  }

  async getStream() {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        width: config.display.width,
        height: config.display.height
      }
    });
  }

  /* What's the point of being a conductor if no-one throws roses at you?
     TODO: Replace with rotten tomatoes for your enemies.
  */ 
  renderFallingRoses() {
    const interval = setInterval(() => {
      if (!this.isFinishPage) clearInterval(interval);

      const rose = document.createElement('div');
      const roseImg = document.createElement('img');
      roseImg.src = roseImageSrc;
      rose.classList.add('rose');
      rose.style.left = Math.round(Math.random() * window.innerWidth) + 'px';

      const flipped = Math.round(Math.random());
      const angle = (Math.random() - 0.5) * 35;
      let transformString = 'rotateZ(' + angle + 'deg)';
      if (flipped) transformString += ' scaleX(-1)';
      console.log(transformString)
      roseImg.style.transform = transformString;

      rose.appendChild(roseImg);
      document.querySelector('.roses-container').appendChild(rose);
      this.roses.push(rose);
      this.rosePositions.push(0);
    }, config.display.roseInterval);

    this.fallingRosesLoop();
  }

  fallingRosesLoop() {
    if (!this.isFinishPage) return;

    for (let i = 0; i < this.roses.length; i++) {
      this.roses[i].style.transform = "translateY(" + this.rosePositions[i] + "px)";
      this.rosePositions[i] = this.rosePositions[i] + config.display.roseSpeed;
      if (this.rosePositions[i] >= window.innerHeight) {
        this.roses.splice(i, 1);
        this.rosePositions.splice(i, 1);
      }
    }
    requestAnimationFrame(this.fallingRosesLoop.bind(this));
  }

  /* Called if webcam error */
  renderVideoError() {
    show(this.pages.error, 'flex');
    this.elems.errorText.innerHTML = "The orchestra needs to see its conductor! Please connect your webcam or allow us to access it, and refresh the page.";
  }

  /* Called when the experience restarts */
  renderRestart() {
    this.props.restart();
    this.renderSongProgress(0);
    this.isFinishPage = false;
    this.applauseAudio.pause();
    this.applauseAudio.currentTime = 0;
    this.roses = [];
    this.rosePositions = [];
    document.querySelectorAll('.rose').forEach(rose => rose.remove());
    this.pages.main.classList.remove('conducting-mode');
    show(this.elems.calibrationOverlay, 'flex');
    show(this.elems.calibrationOverlayImg);
    show(this.elems.countdownOverlay, 'flex');
    hide(this.pages.finish);
    this.pages.finish.classList.remove('fade-in');
    hide(this.pages.main);
    show(this.pages.start, 'flex');
    this.elems.calibrationOverlay.classList.remove('success');
    document.querySelector('.instructions p').innerHTML = "Fit your body in frame, Maestro. This is a one person experiment.";
    document.querySelector('.instructions p').style.transform = "scale(1)";
  }
}