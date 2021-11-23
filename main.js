import WakewordDetector from '@mathquis/node-personal-wakeword'
import Stream from 'stream'

import path from 'path';
import { fileURLToPath } from 'url';
import fileSystem from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const matrixKeys = {
  true: 0,
  false: 1
}

const heyGalileos = [
  './keywords/heyGalileoLiveVlad_no_silence.wav',
  './keywords/heyGalileoLiveVlad2.wav',
  './keywords/heyGalileoLiveVlad.wav',

  './keywords/heyGalileo1.wav',
  './keywords/heyGalileo2.wav',    
  './keywords/heyGalileo3.wav',
  './keywords/heyGalileo4.wav',
  './keywords/heyGalileo5.wav',    
  './keywords/heyGalileo6.wav',
  './keywords/heyGalileo7.wav',
  './keywords/heyGalileo8.wav',    
  './keywords/heyGalileo9.wav',
  './keywords/heyGalileo10.wav',
  './keywords/heyGalileo11.wav',
  './keywords/heyGalileo12.wav',    
  './keywords/heyGalileo22.wav', 
  
  './keywords/heyGalileoIza1.wav',
  './keywords/heyGalileoIza2.wav',
  './keywords/heyGalileoIza3.wav',
  './keywords/heyGalileoIza6.wav',
  './keywords/heyGalileoIza7.wav',
  './keywords/heyGalileoIza8.wav',
  './keywords/heyGalileoIza9.wav',

  './keywords/heyGalileoNicole1.wav',
  './keywords/heyGalileoNicole4.wav',
  './keywords/heyGalileoNicole6.wav',
  './keywords/heyGalileoNicole8.wav',
  './keywords/heyGalileoNicole10.wav',
  './keywords/heyGalileoNicole11.wav',

  './keywords/heyGalileoUna1.wav',
  './keywords/heyGalileoUna2.wav',
  './keywords/heyGalileoUna5.wav',
  './keywords/heyGalileoUna7.wav',
  './keywords/heyGalileoUna8.wav',

  './keywords/heyGalileoUna1.wav',
  './keywords/heyGalileoUna3.wav',
  './keywords/heyGalileoUna6.wav',
  './keywords/heyGalileoUna7.wav',
  './keywords/heyGalileoUna10.wav',
]

// Vlad best: samples 21 & 22 with threshold 0.527 ... 80% accuracy
// Iza best: samples 3 & 7 with threshold 0.63 ... 77% accuracy
// Una best: samples 1 & 2 & 5 & 7 with threshold 0.4 ... 78% accuracy

// Overall Vlad & Iza & Nicole & Una threshold 0.4 ... 56.05% accuracy
// Confusion matrix: 
//                | Expected True | Expected False 
// ------------------------------------------------
// Detected True  |    16               30
// ------------------------------------------------
// Detected False |    39               74


// Overall: averaged V1-V9 & V11-V12 & V22 with I1-I3 & I7 - I9  threshold 0.53... 64.4% accuracy

//                | Expected True | Expected False 
// ------------------------------------------------
// Detected True  |    15               13
// ------------------------------------------------
// Detected False |    19               43


// Overall: averaged V1-V9 & V11 & V12 & V22 with I1-I3 & I7 ... threshold 0.5 ... 63% accuracy

//                | Expected True | Expected False 
// ------------------------------------------------
// Detected True  |    24               23
// ------------------------------------------------
// Detected False |    10               33



// Overall: samples V11 & V12 & V22 & I3 & I7 threshold 0.60 ... 61% accuracy (half of expected were also detected)
//                | Expected True | Expected False 
// ------------------------------------------------
// Detected True  |    17               18
// ------------------------------------------------
// Detected False |    17               38


// Overall: samples V21 & V22 & I3 & I7 with  threshold 0.63 ... 63% accuracy (very low on expected & detected true)
// Overall: samples V21 & V22 & I3 & I7 with  threshold 0.60 ... 54% accuracy
// Overall: samples V21 & V22 & I3 & I7 with  threshold 0.57 ... 47% accuracy

export async function checkInput(paths, keyword) {
  let detected = false
  let successful = 0
  let confusionMatrix = [[0, 0], [0, 0]]

  let detector = new WakewordDetector({
    threshold: 0.41
    // threshold: 0.527 // - vlad best
    // threshold: 0.63
    // threshold: 0.6
    // threshold: 0.53
  })

  await detector.addKeyword('heyGalileo', heyGalileos, {
    // disableAveraging: true,
    disableAveraging: false,
    threshold: 0.41
    // threshold: 0.527
    // threshold: 0.63
    // threshold: 0.6
    // threshold: 0.53
  })

  detector.enableKeyword(keyword)

  detector.on('ready', () => {
    console.log('listening...')
  })

  detector.on('data', ({keyword, score, threshold, timestamp}) => {
    console.log(`Detected "${keyword}" with score ${score} / ${threshold}`)
    detected = true
  })

  let detectionStream = new Stream.Writable({
    objectMode: true,
    write: (data, enc, done) => {
      console.log(data)
      done()
    }
  })
  detector.pipe(detectionStream)


  const keys = Object.keys(paths)
  const length = keys.length

  let pathToAudio = keys[0]
  let expected = paths[pathToAudio]

  let filePath = path.resolve(__dirname, pathToAudio)
  let readStream = fileSystem.createReadStream(filePath)
  readStream.pipe(detector)

  var i = 1;

  async function check() { 
    setTimeout(async function() {  
      console.log(" Detected - " + detected + ", Expected - " + expected)
      if (detected === expected) {
        successful++
      } else {
        console.log('-------- wrong for -------' + filePath)
      }

      confusionMatrix[matrixKeys[detected]][matrixKeys[expected]]++

      detected = false
      readStream.unpipe(detector)

      detector = new WakewordDetector({
        threshold: 0.41
        // threshold: 0.58
        // threshold: 0.527 //- vlad best
        // threshold: 0.63
        // threshold: 0.6
        // threshold: 0.53
      })

      await detector.addKeyword('heyGalileo', heyGalileos, {
        // disableAveraging: true,
        disableAveraging: false,
        threshold: 0.41
        // threshold: 0.58
        // threshold: 0.527 //- vlad best
        // threshold: 0.63
        // threshold: 0.6
        // threshold: 0.53
      })

      detector.enableKeyword(keyword)

      detector.on('ready', () => {
        console.log('listening...')
      })

      detector.on('data', ({keyword, score, threshold, timestamp}) => {
        console.log(`Detected "${keyword}" with score ${score} / ${threshold}`)
        detected = true
      })

      detectionStream = new Stream.Writable({
        objectMode: true,
        write: (data, enc, done) => {
          console.log(data)
          done()
        }
      })
      detector.pipe(detectionStream)
      
      pathToAudio = keys[i]
      expected = paths[pathToAudio]

      filePath = path.resolve(__dirname, pathToAudio)
      readStream = fileSystem.createReadStream(filePath)
      readStream.pipe(detector)

      i++                    
      if (i < length) {           
        check()          
      } else if (i == length) {
        setTimeout(() => {
          console.log(filePath + " Detected - " + detected + ", Expected - " + expected)
          if (detected === expected) {
            successful++
          } else {
            console.log('-------- wrong for -------' + filePath)
          }

          confusionMatrix[matrixKeys[detected]][matrixKeys[expected]]++

          readStream.unpipe(detector)

          console.log("Successful attempts: " + successful + " from Total attempts: " + length)
          console.log("Accuracy - " + successful * 100 / length + "%")
          console.log("Confusion matrix: ")
          console.log("               | Expected True | Expected False ")
          console.log("------------------------------------------------")
          console.log("Detected True  |    " + confusionMatrix[0][0] + "               " + confusionMatrix[0][1])
          console.log("------------------------------------------------")
          console.log("Detected False |    " + confusionMatrix[1][0] + "               " + confusionMatrix[1][1])
        }, 500)
      }                    
    }, 500)
  }

  check()
}


const pathsGalileo = {
  // ----------- Vlad -----------------
  './keywords/heyGalileoLiveVlad_no_silence.wav': true,
  './keywords/heyGalileoLiveVlad2.wav': true,
  './keywords/heyGalileoLiveVlad.wav': true,

  './keywords/heyGalileo11.wav': true,
  './keywords/heyGalileo12.wav': true,
  './keywords/heyGalileo1.wav': true,
  './keywords/heyGalaxyVlad.wav': false,
  './keywords/abrakadabra2.wav': false,
  './keywords/heyGalileo23.wav': true,
  './keywords/heyGalileo7.wav': true,
  './keywords/heyGalileo5.wav': true,
  './keywords/goodJobVlad.wav': false,
  './keywords/galleriaVlad.wav': false,
  './keywords/GuadalajaraVlad.wav': false,
  './keywords/heyGalileo13.wav': true,
  './keywords/garlicVlad.wav': false,
  './keywords/getThereVlad.wav': false,
  './keywords/heyGeorgeVlad.wav': false,
  './keywords/heyGalileo21.wav': true,
  './keywords/heyGalileo22.wav': true,
  './keywords/guiltyVlad.wav': false,
  './keywords/heyGalileo3.wav': true,
  './keywords/abrakadabraVlad1.wav': false,
  './keywords/heyGalileo24.wav': true,
  './keywords/heyGalileo15.wav': true,
  './keywords/greatWork.wav': false,
  './keywords/heyGalileo19.wav': true,
  './keywords/heyGalileo20.wav': true,
  './keywords/glueVlad.wav': false,
  './keywords/helloVlad.wav': false,
  './keywords/helloGoogleVlad.wav': false,
  './keywords/gloryVlad.wav': false,
  './keywords/heyGoogleVlad.wav': false,
  './keywords/goodMorningVlad.wav': false,
  './keywords/greatMeetingYouAllVlad.wav': false,
  './keywords/heyGalileo9.wav': true,
  './keywords/heyGalileo2.wav': true,
  './keywords/heyGalileo6.wav': true,
  './keywords/heyThereVlad.wav': false,
  './keywords/hocuspocus1.wav': false,
  './keywords/heyGalileo14.wav': true,
  './keywords/heyGalileo25.wav': true,
  './keywords/goldVlad.wav': false,
  './keywords/heyGalileo4.wav': true,
  './keywords/heyVlad.wav': false,
  './keywords/abrakadabra1.wav': false,
  './keywords/heyGoogleVlad2.wav': false,
  './keywords/abrakadabraVlad2.wav': false,
  './keywords/heyGalileo16.wav': true,
  './keywords/heyGalileo17.wav': true,
  './keywords/heyGalileo10.wav': true,
  './keywords/goOnVlad.wav': false,
  './keywords/heyGarciaVlad.wav': false,
  './keywords/heyGalileo8.wav': true,
  './keywords/getThereVlad.wav': false,
  './keywords/heyGalileo18.wav': true,
  './keywords/galaVlad.wav': false,
  './keywords/ohGodVlad.wav': false,
  './keywords/wellDoneVlad.wav': false,

  // ----------- Iza ------------------
  './keywords/heyGalileoIza1.wav': true,
  './keywords/heyGallaxyIza.wav': false,
  './keywords/heyGalileoIza7.wav': true,
  './keywords/heyGalileoIza5.wav': true,
  './keywords/goodJobIza.wav': false,
  './keywords/galleriaIza.wav': false,
  './keywords/guadalajaraIza.wav': false,
  './keywords/garlicIza.wav': false,
  './keywords/getThereIza.wav': false,
  './keywords/heyGeorgeIza.wav': false,
  './keywords/guiltyIza.wav': false,
  './keywords/heyGalileoIza3.wav': true,
  './keywords/greatWorkIza.wav': false,
  './keywords/glueIza.wav': false,
  './keywords/helloIza.wav': false,
  './keywords/helloGoogleIza.wav': false,
  './keywords/gloryIza.wav': false,
  './keywords/heyGoogleIza.wav': false,
  './keywords/goodMorningIza.wav': false,
  './keywords/greatMeetingYouAllIza.wav': false,
  './keywords/heyGalileoIza9.wav': true,
  './keywords/heyGalileoIza2.wav': true,
  './keywords/heyGalileoIza6.wav': true,
  './keywords/heyThereIza.wav': false,
  './keywords/hocuspocusIza.wav': false,
  './keywords/goldIza.wav': false,
  './keywords/heyGalileoIza4.wav': true,
  './keywords/heyIza.wav': false,
  './keywords/heyGoogleIza2.wav': false,
  './keywords/goOnIza.wav': false,
  './keywords/heyGarciaIza.wav': false,
  './keywords/heyGalileoIza8.wav': true,
  './keywords/getThereIza.wav': false,
  './keywords/galaIza.wav': false,
  './keywords/ohGodIza.wav': false,
  './keywords/wellDoneIza.wav': false,

  // ----------- Nicole ------------------
  './keywords/heyGalileoNicole1.wav': true,
  './keywords/heyGalaxyNicole.wav': false,
  './keywords/heyGalileoNicole7.wav': true,
  './keywords/heyGalileoNicole5.wav': true,
  './keywords/goodJobNicole.wav': false,
  './keywords/galleriaNicole.wav': false,
  './keywords/guadalajaraNicole.wav': false,
  './keywords/garlicNicole.wav': false,
  './keywords/getThereNicole.wav': false,
  './keywords/heyGeorgeNicole.wav': false,
  './keywords/guiltyNicole.wav': false,
  './keywords/heyGalileoNicole3.wav': true,
  './keywords/greatWorkNicole.wav': false,
  './keywords/glueNicole.wav': false,
  './keywords/helloNicole.wav': false,
  './keywords/helloGoogleNicole.wav': false,
  './keywords/gloryNicole.wav': false,
  './keywords/heyGoogleNicole.wav': false,
  './keywords/goodMorningNicole.wav': false,
  './keywords/greatMeetingYouAllNicole.wav': false,
  './keywords/heyGalileoNicole9.wav': true,
  './keywords/heyGalileoNicole2.wav': true,
  './keywords/heyGalileoNicole6.wav': true,
  './keywords/heyThereNicole.wav': false,
  './keywords/hocuspocusNicole.wav': false,
  './keywords/goldNicole.wav': false,
  './keywords/heyGalileoNicole4.wav': true,
  './keywords/heyNicole.wav': false,
  './keywords/goOnNicole.wav': false,
  './keywords/heyGarciaNicole.wav': false,
  './keywords/heyGalileoNicole8.wav': true,
  './keywords/getThereNicole.wav': false,
  './keywords/galaNicole.wav': false,
  './keywords/ohGodNicole.wav': false,
  './keywords/wellDoneNicole.wav': false,

  // ----------- Una ------------------
  './keywords/heyGalileoUna1.wav': true,
  './keywords/heyGalaxyUna.wav': false,
  './keywords/heyGalileoUna7.wav': true,
  './keywords/heyGalileoUna5.wav': true,
  './keywords/goodJobUna.wav': false,
  './keywords/galleriaUna.wav': false,
  './keywords/guadalajaraUna.wav': false,
  './keywords/garlicUna.wav': false,
  './keywords/getThereUna.wav': false,
  './keywords/heyGeorgeUna.wav': false,
  './keywords/guiltyUna.wav': false,
  './keywords/heyGalileoUna3.wav': true,
  './keywords/greatWorkUna.wav': false,
  './keywords/glueUna.wav': false,
  './keywords/helloUna.wav': false,
  './keywords/gloryUna.wav': false,
  './keywords/goodMorningUna.wav': false,
  './keywords/greatMeetingYouAllUna.wav': false,
  './keywords/heyGalileoUna9.wav': true,
  './keywords/heyGalileoUna2.wav': true,
  './keywords/heyGalileoUna6.wav': true,
  './keywords/heyThereUna.wav': false,
  './keywords/hocuspocusUna.wav': false,
  './keywords/goldUna.wav': false,
  './keywords/heyGalileoUna4.wav': true,
  './keywords/heyUna.wav': false,
  './keywords/goOnUna.wav': false,
  './keywords/heyGarciaUna.wav': false,
  './keywords/heyGalileoUna8.wav': true,
  './keywords/getThereUna.wav': false,
  './keywords/galaUna.wav': false,
  './keywords/ohGodUna.wav': false,
  './keywords/wellDoneUna.wav': false,

  // ----------- Bianca ------------------
  './keywords/heyGalileoBianca1.wav': true,
  './keywords/heyGalaxyBianca.wav': false,
  './keywords/heyGalileoBianca7.wav': true,
  './keywords/heyGalileoBianca5.wav': true,
  './keywords/goodJobBianca.wav': false,
  './keywords/galleriaBianca.wav': false,
  './keywords/guadalajaraBianca.wav': false,
  './keywords/garlicBianca.wav': false,
  './keywords/getThereBianca.wav': false,
  './keywords/heyGeorgeBianca.wav': false,
  './keywords/heyGalileoBianca3.wav': true,
  './keywords/greatWorkBianca.wav': false,
  './keywords/glueBianca.wav': false,
  './keywords/helloBianca.wav': false,
  './keywords/gloryBianca.wav': false,
  './keywords/goodMorningBianca.wav': false,
  './keywords/greatMeetingYouAllBianca.wav': false,
  './keywords/heyGalileoBianca9.wav': true,
  './keywords/heyGalileoBianca2.wav': true,
  './keywords/heyGalileoBianca6.wav': true,
  './keywords/heyThereBianca.wav': false,
  './keywords/hocuspocusBianca.wav': false,
  './keywords/goldBianca.wav': false,
  './keywords/heyGalileoBianca4.wav': true,
  './keywords/heyBianca.wav': false,
  './keywords/goOnBianca.wav': false,
  './keywords/heyGarciaBianca.wav': false,
  './keywords/heyGalileoBianca8.wav': true,
  './keywords/getThereBianca.wav': false,
  './keywords/galaBianca.wav': false,
  './keywords/ohGodBianca.wav': false,
  './keywords/wellDoneBianca.wav': false,

  // ----------- Other Words ------------------
  './OtherWords/about_time.wav': false,
  './OtherWords/absolute_end.wav': false,
  './OtherWords/agony.wav': false,
  './OtherWords/ah_yes.wav': false,
  './OtherWords/ahem.wav': false,
  './OtherWords/all_systems_go.wav': false,
  './OtherWords/ass_whooped.wav': false,
  './OtherWords/available.wav': false,
  './OtherWords/bad_taste.wav': false,
  './OtherWords/bah_humbug.wav': false,
  './OtherWords/beat_it_hippy.wav': false,
  './OtherWords/bee-atch.wav': false,
  './OtherWords/best_4_less.wav': false,
  './OtherWords/best_prices.wav': false,
  './OtherWords/bite_me.wav': false,
  './OtherWords/boo_yah.wav': false,
  './OtherWords/breathing_down_neck.wav': false,
  './OtherWords/burp.wav': false,
  './OtherWords/buy_confidence.wav': false,
  './OtherWords/buy_one_free.wav': false,
  './OtherWords/buy_two.wav': false,
  './OtherWords/cat_flat.wav': false,
  './OtherWords/chamber_no_exit.wav': false,
  './OtherWords/check_out_whats_new.wav': false,
  './OtherWords/come_gone.wav': false,
  './OtherWords/crappy.wav': false,
  './OtherWords/dont_tell.wav': false,
  './OtherWords/enough_of_you.wav': false,
  './OtherWords/go_away.wav': false,
  './OtherWords/go.wav': false,
  './OtherWords/good_little_girl.wav': false,
  './OtherWords/goodbye.wav': false,
  './OtherWords/got_it.wav': false,
  './OtherWords/groovy.wav': false,
  './OtherWords/grunt.wav': false,
  './OtherWords/hard_drive_crash.wav': false,
  './OtherWords/hate_you.wav': false,
  './OtherWords/hear_ye.wav': false,
  './OtherWords/ho_ho_ho.wav': false,
  './OtherWords/hubba_hubba.wav': false,
  './OtherWords/idiot.wav': false,
  './OtherWords/irritate_me.wav': false,
  './OtherWords/isnt_4_your_eyes.wav': false,
  './OtherWords/janus_burp.wav': false,
  './OtherWords/junk_mail.wav': false,
  './OtherWords/king_love.wav': false,
  './OtherWords/let_me_out.wav': false,
  './OtherWords/lets_play.wav': false,
  './OtherWords/malfunction.wav': false,
  './OtherWords/nuthin.wav': false,
  './OtherWords/oh_my_god.wav': false,
  './OtherWords/place_your_bets.wav': false,
  './OtherWords/pucker_up.wav': false,
  './OtherWords/questions_money.wav': false,
  './OtherWords/sacre.wav': false,
  './OtherWords/satisfaction.wav': false,
  './OtherWords/sick_man.wav': false,
  './OtherWords/why_torturing_me.wav': false,
  './OtherWords/wise_ass.wav': false,
  './OtherWords/wow.wav': false,
  './OtherWords/yankee_doodle.wav': false,
}

checkInput(pathsGalileo, 'heyGalileo')