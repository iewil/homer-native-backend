// Imports
const express = require('express')
const router = express.Router()

async function getLocationReports (req, res) {
  const { order_id: orderId } = req.params
  try {
    // TO-DO

    let locationReports
    res.status(200).send({ locationReports })
  } catch (err) {
    res.status(500).send(err.message)
  }
};

async function createLocationReport (req, res) {
 
  // TO-DO: Verify JWT

  const { 
    latitude,
    longitude,
    metadata
  } = req.body

  try {
    // TO-DO
    res.status(200).send('Ok')
  } catch (err) {
    res.status(500).send(err.message)
  }
};

router.get('/', getLocationReports)
router.post('/', createLocationReport)

module.exports = router;