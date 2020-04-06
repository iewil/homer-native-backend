// Utility modules
const jsonfile = require('jsonfile')

const db = require('../app/src/models')

const OUTPUT_FILE = 'quaratine_orders.json'

async function main () {
  // connect to the db
  await db.sequelize.sync()
  console.log('connected to the db...')

  // get all quarantine orders
  console.log(`Retrieving QOs from db from QuarantineOrders model...`)
  let count
  let qos
  try {
    { count, rows: qos } = await models.QuarantineOrders.findAndCountAll({})
  } catch (error) {
    console.log('Error occoured while retrieving quarantine orders:', error)
    throw error
  }
  console.log(`Total quarantine orders: ${count}`)
  console.log(`Writing to ${OUTPUT_FILE}...`)
  qos = qos.map(qo => ({ id: qo.id, contact_number: qo.contact_number }))
  jsonfile.writeFileSync(
    OUTPUT_FILE,
    qos,
    { spaces: 2 },
  );
}

main()
