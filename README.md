# Semi-Conductor 🎻

![An animation of Semi-Conductor in action.](semi-conductor.gif)

[Semi-Conductor](https://semiconductor.withgoogle.com) allows you to conduct a virtual orchestra using only your web browser & webcam. Try it out [live here](https://semiconductor.withgoogle.com)!

It uses [Posenet](https://github.com/tensorflow/tfjs-models/tree/master/posenet) to detect your body pose, and from that how fast you are moving your hands. Using this data and the [Tone.js](https://github.com/Tonejs/Tone.js/) web audio library, it plays real samples of orchestral instruments playing individual notes at the speed of your conducting, which play live from a score you that can edit.

It's been build to be remixed, so read on to learn how to build and edit your own version of Semi-Conductor, with custom music and instruments.

## Quick Start

```sh
yarn  # Install dependencies
```
```sh
yarn start  # Start a local dev server
```
```sh
yarn build  # Build static site into the /dist folder
```

## Code Structure

Semi-Conductor is built in vanilla JS without a framework. Each JS file in the `/scripts` folder contains a class module, with each class controlling one portion of the app (also there are some helper files with useful functions). It's designed so that modules can be used or deleted according to how you want to remix the app.

- `main.js` controls the primary app state & functions, including loading the app and instantiating the other classes
- `renderer.js` handles all the UI/DOM updating
- `orchestra.js` controls the graphic of the orchestra, made with PIXI.js
- `pose-controller.js` uses TFJS to get the pose state from the webcam with Posenet
- `posenet-renderer.js` renders the pose skeleton in the interface
- `audio-player.js` handles the MIDI playback & loading of samples using Tone.js

## How to remix this

#### Adding instrument samples

We haven't included the original audio samples used in the live [Semi-Conductor experiment](https://semiconductor.withgoogle.com), but you can use an open sound library like [Sonatina Symphonic Orchestra](https://github.com/peastman/sso) (just make sure you have the rights to use samples you choose in accordance to their licence agreement), or even record your own.

Add your samples to `/static/samples`, and then add to `/src/assets/samples.json` the relative paths from the `/static/samples` directory to each sample. Samples are organised first by instrument name, then by note. Note descriptions are of the format `C4` for middle C, or `D#5` for the D sharp the octave above middle C. You don't need to have all the notes for a given instrument, Tone.js will interpolate between the samples you have provided.

#### Changing instrumentation

Semi-Conductor is designed to work with a string quartet, however you can change the instrumentation as you desire. Create a rock band, percussion ensemble or synth orchestra if you want! If you're low on disk space, you could even replicate John Cage's [4'33"](https://youtu.be/Oh-o3udImy8?t=57).

Follow the steps above with whichever instruments & samples you want to add. Then, edit `config.js` to include the instrument names you want to have play for each zone (instruments change as you move your hands from the left to the right of the screen while conducting). 

You will also need to have a `song.json` file (see below) that only contains instrument names that correspond the ones in `samples.json`. You may need to remove or edit the `orchestra.js` module, as it will break if it doesn't recognise the instrument names.

#### Changing the MIDI song

The current MIDI song is a custom arrangement of Mozart's *Eine Kleine Nachtmusik* made by us. But you can swap this out with any MIDI file, you just need to convert it to JSON and make sure you have samples listed in `samples.json` with the same instrument names as the tracks.

To build a `song.json` file, create or acquire a MIDI file you want to use. Then, head to [this Tone.js website](http://tonejs.github.io/Midi/) to convert the MIDI into a JSON file that Tone.js can read. Go through the JSON file and edit the instrument names to correspond to the instrument names in `samples.json` and then move this file to `/src/assets/song.json`.

## Contributors

Built by [Rupert Parry](https://www.rparry.me/), [Melissa Lu](https://melissaludesigns.com/), Samantha Cordingley, [Haylie Craig](https://www.hayliecraig.com/), and the team at Google Creative Lab, Sydney.

## License & Notes

Semi-Conductor has been made available under the [Apache 2.0 license](https://www.apache.org/licenses/LICENSE-2.0) (see LICENSE file in this repository for details).

We encourage open sourcing projects as a way of learning from each other. Please respect our and other creators’ rights, including copyright and trademark rights when present when sharing these works and creating derivative work. If you want more info on Google's policy, you can find it [here](https://www.google.com/permissions/). To contribute to the project, please refer to the CONTRIBUTING file in this repository.

This is an experiment, not an official Google product. We do our best to support and maintain this experiment, but your mileage may vary. 
