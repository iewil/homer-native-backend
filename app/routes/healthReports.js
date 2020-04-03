// Imports
const express = require('express')
const router = express.Router()

async function getHealthReports (req, res) {
  const { order_id: orderId } = req.params
  try {
    // TO-DO

    let healthReports
    res.status(200).send({ healthReports })
  } catch (err) {
    res.status(500).send(err.message)
  }
};

async function createHealthReport (req, res) {
 
  // TO-DO: Verify JWT

  const { 
    temperature, 
    cough, 
    sore_throat: soreThroat, 
    runny_nose: runnyNose, 
    shortness_of_breath: shortnessOfBreath, 
    photo_s3_key: photoS3Key, 
    metadata, 
    timestamp
  } = req.body

  try {
    // TO-DO
    res.status(200).send('Ok')
  } catch (err) {
    res.status(500).send(err.message)
  }
};

router.get('/', getHealthReports)
router.post('/', createHealthReport)

module.exports = router;