// Imports
const express = require('express')
const router = express.Router()

const { LocationReportService } = require('../services/LocationReportService')

async function getLocationReports (req, res) {
  const { order_id: orderId } = req.params
  try {
    // TO-DO

    let locationReports = await LocationReportService.getAllLocations(orderId)
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

router.get('/:order_id', getLocationReports)
router.post('/', createLocationReport)

module.exports = router;