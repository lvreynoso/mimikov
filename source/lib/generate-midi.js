// generate-midi.js

import midiFile from 'midifile'
import midiEvents from 'midievents'
import fs from 'fs'

import Queue from './queue.js'

const START_TOKEN = 'START_TOKEN'
const STOP_TOKEN = 'STOP_TOKEN'

// markov data will be an object with "map" and "meta" properties.
// the values of these properties will be a markov map of notes
// and a histogram for metadata, respectively.
// the markov data is generated by generate-map.js

const generate = (markovData) => {
    return sampleMidi();
}

export default generate;
