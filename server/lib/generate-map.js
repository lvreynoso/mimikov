"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom.iterable");

var _midifile = _interopRequireDefault(require("midifile"));

var _midievents = _interopRequireDefault(require("midievents"));

var _fs = _interopRequireDefault(require("fs"));

var _queue = _interopRequireDefault(require("./queue.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// generate-map.js
// take an array of midi info and turn it into
// a markov map usable for generating songs
// import _ from 'lodash'
const START_TOKEN = 'START_TOKEN';
const STOP_TOKEN = 'STOP_TOKEN'; // midiArray will be an array of midiData objects, as described in
// transform-midi.js. order and category will be passed by the controller

const generateMap = (midiArray, order, category) => {
  // generate a map of notes.
  // and the first part of that - shove all the notes together.
  // we convert them to strings for easier comparison and storage.
  let tokenArray = [];
  midiArray.forEach(song => {
    // get a list of tracks
    let trackNumbers = Object.keys(song.trackNotes);
    trackNumbers.sort((a, b) => {
      return parseInt(a) - parseInt(b);
    }); // go through each track and push notes to the tokenArray

    trackNumbers.forEach(track => {
      let notes = song.trackNotes[track];
      tokenArray.push(START_TOKEN);
      notes.forEach(note => {
        let noteToken = tokenize(note);
        tokenArray.push(noteToken);
      });
      tokenArray.push(STOP_TOKEN);
    });
  }); // now we should have an array of note tokens.
  // console.log(tokenArray);
  // indeed we do.
  // second - we go through the tokens and build up a markov map.
  // it's better in the original python.

  let markovMap = {};
  let startingItems = [];
  console.log(`Order: ${order}`);

  for (let n = 0; n < order; n++) {
    startingItems.push(tokenArray[n]);
  }

  console.log(`Starting items: ${startingItems}`);
  let stateTracker = new _queue.default(order);
  startingItems.forEach(item => {
    stateTracker.enqueue(item);
  }); // let trackerItems = stateTracker.items();
  // since javascript does not have tuples and arrays cannot be used
  // as keys in an object, we need to transform the state into a string
  // where tokens are separated by a pipe '|'

  console.log(stateTracker.items());
  let state = stringify(stateTracker.items()); // console.log(state);

  markovMap[state] = {}; // this is a very big loop.

  for (let index = order; index < tokenArray.length; index++) {
    let newToken = tokenArray[index];
    stateTracker.enqueue(newToken);
    let newState = stringify(stateTracker.items()); // add the new state to the markov map

    if (markovMap[newState] == undefined) {
      markovMap[newState] = {};
    } // update the token count for the current state


    if (markovMap[state][newToken] == undefined) {
      markovMap[state][newToken] = 1;
    } else {
      markovMap[state][newToken] += 1;
    }

    state = newState;
  } // console.log(markovMap);
  // write map to disk
  // let stringMap = JSON.stringify(markovMap);
  // let filename = `${category}_${order}.markov`
  // let path = `temp/${filename}`;
  // let writeStream = fs.createWriteStream(path);
  // writeStream.write(stringMap, 'utf8');
  // writeStream.on('finish', () => {
  //     console.log('Wrote data to file.');
  // })
  // writeStream.close();
  // did it work?
  // yes it did. wow.
  // ok now we have to collect the meta information
  // i'm just going to do a very simple statistical sampling
  // our data structure


  let markovMetaData = {
    ticksPerBeat: {},
    SMPTEFrames: {},
    ticksPerFrame: {},
    keySignature: {},
    timeSignature: {},
    tempo: {} // copy the meta properties

  };
  midiArray.forEach(song => {
    let meta = song.metaData;
    let properties = Object.keys(meta);
    properties.forEach(property => {
      if (meta[property] != undefined) {
        let rawData = meta[property];
        let dataPoint = ''; // what we copy depends on the property

        switch (property) {
          case 'ticksPerBeat':
          case 'SMPTEFrames':
          case 'ticksPerFrame':
            dataPoint = rawData;
            break;

          case 'keySignature':
            dataPoint = `${rawData.key}-${rawData.scale}`;
            break;

          case 'timeSignature':
            dataPoint = `${rawData.param1}-${rawData.param2}-${rawData.param3}-${rawData.param4}`;
            break;

          case 'tempo':
            dataPoint = `${rawData.tempo}`;
            break;

          default:
            break;
        }

        if (markovMetaData[property][dataPoint] == undefined) {
          markovMetaData[property][dataPoint] = 1;
        } else {
          markovMetaData[property][dataPoint] += 1;
        }
      }
    });
  }); // write metadata to disk
  // let metaStringMap = JSON.stringify(markovMetaData);
  // let metaFilename = `${category}_${order}.meta`
  // let metaPath = `temp/${metaFilename}`;
  // let metaWriteStream = fs.createWriteStream(metaPath);
  // metaWriteStream.write(metaStringMap, 'utf8');
  // metaWriteStream.on('finish', () => {
  //     console.log('Wrote data to file.');
  // })
  // metaWriteStream.close();
  // did it work?
  // yes!

  let markovData = {
    map: markovMap,
    meta: markovMetaData
  };
  return markovData;
};

function tokenize(note) {
  let token = `${note.pitch}-${note.velocity}-${note.alpha}-${note.duration}`;
  return token;
}

function stringify(tokens) {
  let outputString = '';
  tokens.forEach((element, i) => {
    if (i == 0) {
      outputString += `${element}`;
    } else {
      outputString += `|${element}`;
    }
  });
  return outputString;
}

var _default = generateMap;
exports.default = _default;
//# sourceMappingURL=generate-map.js.map