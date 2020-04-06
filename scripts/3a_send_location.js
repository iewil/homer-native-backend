const jsonfile = require('jsonfile')
const program = require('commander')
const _ = require('lodash')
const bluebird = require('bluebird')
const admin = require('firebase-admin');

const db = require('../app/src/models')

const PN_MESSAGE = {
  token: null, // Set to fcmToken
  android: {
    priority: 'high',
    // Set to how long parking command would still be rewlevant
    // Currently 5 mins
    ttl: 60 * 60 * 1000, // milliseconds (60 minutes)
    restrictedPackageName: 'sg.parking.streetsmart', // This ensures message is only sent to this app
    // collapseKey serves as an identifier for a group of messages that can be collapsed
    // so that only the last message gets sent when delivery can be resumed.
    // A maximum of four different collapse keys may be active at any given time.
    // https://firebase.google.com/docs/reference/admin/node/admin.messaging.AndroidConfig.html#optional-collapse-key
    collapseKey: 'singaporeGovernment',
  },
  notification: {
    title: 'Singapore Government',
    body: 'Click here to complete your location reporting',
  }
  data: {
    action: 'getLocation',
  },
}

const SMS_MESSAGE = 'Please submit your location on the Homer App'

async function main ({ firebaseCredentialFilePath, twilioId, twilioToken, twilioNumber, pushNotificationFilePath, smsFilePath }) {

  console.log(`Reading PNs from ${pushNotificationFilePath}...`)
  const pns = jsonfile.readFileSync(pushNotificationFilePath)

  console.log(`Number of PNs: ${pns.length}`)

  // configure firebase messaging
  process.env.GOOGLE_APPLICATION_CREDENTIALS = firebaseCredentialFilePath;
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
  const fcm = admin.messaging();

  console.log(`Sending push notifications...`)
  await bluebird.mapSeries(
    pns,
    pn => {
      console.log(`sending pn for ${pn.qo}`)
      return messaging
        .send({...PN_MESSAGE, token: pn.pn })
        .catch(e => console.log(`error while sending : ${e.name}`))
    }
  )

  console.log('Done sending push notifications')

  console.log(`Reading SMSes from ${smsFilePath}...`)
  const smses = jsonfile.readFileSync(smsFilePath)

  console.log(`Number of SMSes: ${smses.length}`)

  // configure twilio
  const twilio = require('twilio')(twilioId, twilioToken)
  console.log(`Sending smses...`)
  await bluebird.mapSeries(
    smses,
    sms => {
      console.log(`sending sms for ${pn.qo}`)
      return twilio.messages.create({
        body: SMS_MESSAGE,
        from: twilioNumber,
        to: `+${sms.phone}`
      })
      .catch(e => console.log(`error while sending : ${e.name}`))
    }
  )

  console.log('Done sending sms')
}

// -----------------------------------------------------------------------------
// Initiation
// -----------------------------------------------------------------------------
program.requiredOption('--firebaseCredentialFilePath <firebaseCredentialFilePath>', 'Firebase Credentials JSON filename')
program.requiredOption('--twilioId <twilioId>', 'Twilio ID')
program.requiredOption('--twilioToken <twilioToken>', 'Twilio Token')
program.requiredOption('--twilioNumber <twilioNumber>', 'Twilio Number')
program.requiredOption('--pushNotificationFilePath <pushNotificationFilePath>', 'Push Notification JSON filename')
program.requiredOption('--smsFilePath <smsFilePath>', 'SMS JSON filename')
program.parse(process.argv)
main(program.opts())
