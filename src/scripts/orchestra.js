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

import * as PIXI from 'pixi.js';
import instruments from '../assets/gui-instruments.js';

// Width of stage = 1288px

export default class Orchestra {
  constructor(props) {
    this.props = props;
    this.texturesPath = this.props.texturesPath;

    this.maxWidth = 1400;
    this.maxHeight = 670;

    this.instruments = instruments;

    const app = new PIXI.Application({
      width: this.maxWidth,
      height: this.maxHeight,
      transparent: true
    });

    this.offset = { x: -30, y: -160 }

    app.renderer.autoResize = true;
    app.renderer.view.style.maxWidth = 1000 + 'px';

    const container = document.querySelector('.orchestra');
    container.appendChild(app.view);

    this.container = container;
    this.app = app;
    PIXI.loader.add(this.texturesPath).load(this.setup.bind(this));
  }

  /* Set up for the stage */
  setup() {
    this.props.loaded();
    const textures = PIXI.loader.resources[this.texturesPath].textures;

    // Set up stage
    const stage = new PIXI.Sprite(textures['stage']);
    stage.y = (this.maxHeight - stage.height) / 2;
    stage.x = (this.maxWidth - stage.width) / 2;
    this.app.stage.addChild(stage);

    // Set up instruments
    Object.keys(this.instruments).forEach((name) => {
      this.instruments[name].objects.forEach((inst) => {
        inst.x0 += this.offset.x;
        inst.y0 += this.offset.y;

        inst.sprite = new PIXI.Sprite(textures[name]);
        inst.bow.sprite = new PIXI.Sprite(textures[name + 'Bow']);

        inst.bow.sprite.anchor.set(0.5, 0.5);
        inst.bow.sprite.x = inst.bow.x0;
        inst.bow.sprite.y = inst.bow.y0;
        inst.bow.sprite.rotation = inst.bow.rotation0;
        
        inst.sprite.addChild(inst.bow.sprite);

        inst.sprite.anchor.set(0.5, 0.5);
        inst.sprite.x = inst.x0;
        inst.sprite.y = inst.y0
        inst.sprite.rotation = inst.rotation0;

        stage.addChild(inst.sprite);
      });
    });

    // Adapt resolution to screen
    this.app.renderer.view.style.width = "100%";
    this.loop();
  }

  /* For each frame, do this animation (animate any triggered insts) */
  loop() {
    Object.keys(this.instruments).forEach((name) => {
      const animation = this.instruments[name].animation;
      if (animation.triggered) {
        this.instruments[name].objects.forEach((inst) => {
          const sinArgument = (1 / animation.duration) * 2 * Math.PI * (Date.now() - animation.startTime) / 1000;
          inst.bow.sprite.x = inst.bow.x0 + 10 * Math.sin(sinArgument);
          inst.sprite.rotation = inst.rotation0 + 0.025 * Math.sin(sinArgument);
          inst.sprite.y = inst.y0 - 10 * this.velocity * (1 + Math.sin(0.5 * sinArgument));
        });
      }
    })

    requestAnimationFrame(this.loop.bind(this));
  }

  /* Called when a note is triggered for an instrument */
  trigger(instrument, duration, velocity) {
    const inst = this.instruments[instrument];
    if (inst.animation.timeout) clearTimeout(inst.animation.timeout);
    inst.animation.triggered = true;
    inst.animation.startTime = Date.now();
    inst.animation.duration = duration;
    this.velocity = velocity;

    inst.animation.timeout = setTimeout(() => {
      inst.animation.triggered = false;
      clearTimeout(inst.animation.timeout);
    }, duration * 1000);
  }
}