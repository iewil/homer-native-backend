// Utility modules
const jsonfile = require('jsonfile')
const program = require('commander')
const _ = require('lodash')

const db = require('../app/src/models')
const { Op } = require('sequelize')

const PN_FILE = 'pn.json'
const SMS_FILE = 'sms.json'

async function main ({ qoFilePath }) {
  // Read qos from file
  console.log(`Reading QOs from ${qoFilePath}...`)
  const qos = jsonfile.readFileSync(qoFilePath)

  console.log(`Number of QOs: ${qos.length}`)

  // connect to the db
  await db.sequelize.sync()
  console.log('connected to the db...')

  // Get push notification ids
  console.log('Retrieving push notification ids for QOs...')
  let pns
  try {
    pns = await db.PushNotifications.findAll({
      where : {
        order_id : {
          [Op.in]: _.map(qos, 'id')
        }
      }
    })
    pns = pns.map(pn => pn.get({ plain: true }))
  } catch (error) {
    console.log('Error occoured while retrieving notification ids:', error)
    throw error
  }

  console.log(`Number of QOs with push notification: ${pns.length}/${qos.length}`)
  console.log(`Number of QOs to send sms: ${qos.length - pns.length}/${qos.length}`)

  const pn = []
  const sms = []

  qos.forEach(qo => {
    const pnForQo = _.find(pns, { order_id: qo.id})
    if (pnForQo) {
      pn.push({
        qo: qo.id,
        pn: pnForQo.push_notification_id,
        phone: qo.contact_number
      })
    } else {
      sms.push({
        qo: qo.id,
        phone: qo.contact_number
      })
    }
  })

  console.log(`Writing to ${PN_FILE}...`)
  jsonfile.writeFileSync(
    PN_FILE,
    pn,
    { spaces: 2 }
  )

  console.log(`Writing to ${SMS_FILE}...`)
  jsonfile.writeFileSync(
    SMS_FILE,
    sms,
    { spaces: 2 }
  )
}

// -----------------------------------------------------------------------------
// Initiation
// -----------------------------------------------------------------------------
program.requiredOption('--qoFilePath <qoFilePath>', 'Quarantine Order JSON filename')
program.parse(process.argv)
main(program.opts())
