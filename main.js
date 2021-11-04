import WakewordDetector from '@mathquis/node-personal-wakeword'
import Mic from 'mic'
import Stream from 'stream'

import ss from 'socket.io-stream'

import path from 'path';
import { fileURLToPath } from 'url';
import fileSystem from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export async function main(req, res) {
  // Create a new wakeword detection engine
  let detector = new WakewordDetector({
    threshold: 0.5 // Default value
  })

  // Add a new keyword using multiple "templates"
  await detector.addKeyword('abrakadabra', [
    // WAV templates (trimmed with no noise!)
    './keywords/abrakadabra1.wav',
    './keywords/abrakadabra2.wav',
  ], {
    disableAveraging: true, // Disabled by default, disable templates averaging (note that resources consumption will increase)
    threshold: 0.52 // Per keyword threshold
  })

  await detector.addKeyword('heyGalileo', [
	  './keywords/heyGalileo1.wav',
		'./keywords/heyGalileo2.wav',
		'./keywords/heyGalileo3.wav',
		'./keywords/heyGalileo4.wav',
		'./keywords/heyGalileo5.wav',
		'./keywords/heyGalileo6.wav',
		'./keywords/heyGalileo7.wav',
		'./keywords/heyGalileo8.wav',
		'./keywords/heyGalileo9.wav',
	  './keywords/heyGalileo10.wav'
	], {
	  disableAveraging: true,
	  threshold: 0
	})

  detector.enableKeyword('abrakadabra')
  detector.enableKeyword('heyGalileo')

  detector.on('ready', () => {
    console.log('listening...')
  })

  detector.on('error', err => {
    console.error(err.stack)
  })

  detector.on('vad-silence', () => {
    console.log('Hearing silence...')
  })

  detector.on('vad-voice', () => {
    console.log('Hearing voices...')
  })

  // The detector will emit a "data" event when it has detected a keyword in the audio stream
  /* The event payload is:
    {
      "keyword"     : "alexa", // The detected keyword
      "score"       : 0.56878768987, // The detection score
      "threshold"   : 0.5, // The detection threshold used (global or keyword)
      "frames"      : 89, // The number of audio frames used in the detection
      "timestamp"   : 1592574404789, // The detection timestamp (ms)
      "audioData"   : <Buffer> // The utterance audio data (can be written to a file for debugging)
    }
  */
  detector.on('data', ({keyword, score, threshold, timestamp}) => {
    console.log(`Detected "${keyword}" with score ${score} / ${threshold}`)
  })

  // As an alternative to events, the detector is a transform stream that takes audio buffers in and output keyword detection payload
  const detectionStream = new Stream.Writable({
    objectMode: true,
    write: (data, enc, done) => {
      // `data` is equivalent to "data" event payload
      console.log(data)
      done()
    }
  })

  detector.pipe(detectionStream)
  // // Create an audio stream from an audio recorder (arecord, sox, etc.)
  // let recorder = Mic({
  //   channels      : detector.channels, // Defaults to 1
  //   rate          : detector.sampleRate, // Defaults to 16000
  //   bitwidth      : detector.bitLength // Defaults to 16
  // })

  // let stream = recorder.getAudioStream()

  // Pipe to wakeword detector
  // stream.pipe(detector)
  // console.log(stream)

  const filePath = path.resolve(__dirname, './keywords', './abrakadabra1.wav');
    // get file info
   // const stat = fileSystem.statSync(filePath);
  const readStream = fileSystem.createReadStream(filePath);
    // pipe stream with response stream
  readStream.pipe(detector);

  //rss(client).emit('track-stream', stream, { stat });

  console.log("Listening for 10 seconds ...")
  // Destroy the recorder and detector after 10s
  setTimeout(() => {
    // stream.unpipe(detector)
    // stream.removeAllListeners()
    // stream.destroy()
    // stream = null

    // recorder = null

    // detector.removeAllListeners()
    // detector.destroy()
    // detector = null
    console.log(stream)
    console.log("Finished listening")
    res.status(200).json({ status: 'ok', service: 'Hotword service', text: 'Service running'})
  }, 10000)
}
