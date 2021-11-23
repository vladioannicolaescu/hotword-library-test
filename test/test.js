
//jest.mock('@mathquis/node-personal-wakeword')

const { hasUncaughtExceptionCaptureCallback } = require('process')
main = require('./main.js')

//import WakewordDetector from '@mathquis/node-personal-wakeword'
WakewordDetector = require('@mathquis/node-personal-wakeword')
Stream = require('stream')
path =  require('path')
fileSystem = require('fs')
jest.setTimeout(20000)

const givenGalileoRecordings = [
    './keywords/heyGalileo1.wav',
    './keywords/heyGalileo2.wav',
    './keywords/heyGalileo3.wav',
    './keywords/heyGalileoAlex1.wav'
  ]

const testGalileoRecordings = [
  './heyGalileo4.wav',
  './heyGalileo5.wav',
  './heyGalileo6.wav',
  './heyGalileo7.wav',
  './heyGalileo8.wav',
  './heyGalileo9.wav',
  './heyGalileo10.wav',
  './heyGalileoAlex2.wav',
  './heyGalileoAlex3.wav',
  './heyGalileoAlex4.wav'
  ]

let detector = new WakewordDetector({
  threshold: 0.5 // Default value
})

beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    //WakewordDetector.mockClear();
  });
  test('Should print "Detected"', async () => {
    const handler = jest.fn()

    detector.on('data', handler, ({keyword, score, threshold, timestamp}) => {
      console.log(`Detected "${keyword}" with score ${score} / ${threshold}`)
    })

    main({detector: detector})

    expect(handler).toBeCalledTimes(1)

  })

  // test('Calculate Accuracy', async () => {
  //   var detected = 0
  //   var piped = 0

  //   const keywordClient = new WakewordDetector({
  //     sampleRate: 16000,
  //     threshold: 0
  //   })

  //   keywordClient.addKeyword('heyGalileo', givenGalileoRecordings, {
  //     disableAveraging: true,
  //     threshold: 0.5
  //   })
  
  //   keywordClient.enableKeyword('heyGalileo')
  
  //   keywordClient.on('data', () => {
  //     console.log('Detected ---------------------------------------------')
  //     detected++
  //   })

  //   keywordClient.on('close', () => {
      
  //     piped++
  //     if (piped == testGalileoRecordings.length) {
  //       console.log('hello')
  //       expect(detected).toBeGreaterThan(testGalileoRecordings.length / 2)
  //     }
  //   })
  
  //   const detectionStream = new Stream.Writable({
  //     objectMode: true,
  //     write: (data, enc, done) => {
  //       done()
  //     }
  //   })

  //   keywordClient.pipe(detectionStream)

  //   testGalileoRecordings.forEach(
  //     recording => {
  //       const filePath = path.resolve(__dirname, '../keywords', recording);
  //       const readStream = fileSystem.createReadStream(filePath);
  //       readStream.pipe(keywordClient)
  //     }
  //   )

  //   // await new Promise((r) => setTimeout(r, 10000))
  //   // expect(detected).toBeGreaterThan(testGalileoRecordings.length / 2)
  // });

  test('Correct file piped to keyWordClient', () => {
    // Show that mockClear() is working:
    //expect(WakewordDetector).not.toHaveBeenCalled();
  
    //const keywordClient = new WakewordDetector();
    // Constructor should have been called again:
    //expect(WakewordDetector).toHaveBeenCalledTimes(1);

    //const filePath = path.resolve(__dirname, './src/keywords', './heyGalileo1.wav');
    //const readStream = fileSystem.createReadStream(filePath);
    //readStream.pipe(keywordClient)
    //console.log(readStream)
  

    //expect(WakewordDetector).toHaveBeenCalledWith(readStream);

    // const coolSoundFileName = 'song.mp3';
    // soundPlayerConsumer.playSomethingCool();
  
    // // mock.instances is available with automatic mocks:
    // const mockSoundPlayerInstance = SoundPlayer.mock.instances[0];
    // const mockPlaySoundFile = mockSoundPlayerInstance.playSoundFile;
    // expect(mockPlaySoundFile.mock.calls[0][0]).toEqual(coolSoundFileName);
    // // Equivalent to above check:
    // expect(mockPlaySoundFile).toHaveBeenCalledWith(coolSoundFileName);
    // expect(mockPlaySoundFile).toHaveBeenCalledTimes(1);
  });