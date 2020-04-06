// Imports
const express = require('express');

const router = express.Router();

// Middlewares
const Ajv = require('ajv');

// Services
const { LocationReportService } = require('../services/LocationReportService');

// Validators
const ajv = new Ajv();
const { getLocationReportsSchema, createLocationReportSchema } = require('../validators/locationReports');

// Errors
const { DbError } = require('../errors/DbErrors');
const { InputSchemaValidationError } = require('../errors/InputValidationErrors');

async function getLocationReports(req, res) {
  try {
    // 1. Validate request
    const validRequest = ajv.validate(getLocationReportsSchema, req);
    if (!validRequest) throw new InputSchemaValidationError(JSON.stringify(ajv.errors));

    const { order_id: orderId } = req.params;

    // 2. Find all locationReport objects that have the specified orderId
    let locationReportsForOrder;
    try {
      locationReportsForOrder = await LocationReportService.getAllLocationsForOrder(orderId);
      console.log(`Successfully obtained location reports for orderId: ${orderId}`);
    } catch (err) {
      throw new DbError(err);
    }

    const { locationReports } = locationReportsForOrder;
    res.status(200).send({ location_reports: locationReports });
  } catch (err) {
    console.error(`GET /location-reports failed with err: ${err}`);
    res.status(500).send(err.message);
  }
}

async function createLocationReport(req, res) {
  try {
    // 1. Validate request
    const validRequest = ajv.validate(createLocationReportSchema, req);
    if (!validRequest) throw new InputSchemaValidationError(JSON.stringify(ajv.errors));

    const { latitude, longitude, metadata } = req.body;
    const { orderId } = req; // Obtained from JWT in the auth middleware

    // 2. Store locationReport in the DB
    const locationReport = {
      order_id: orderId,
      latitude,
      longitude,
      metadata,
    };
    await LocationReportService.addLocationReport(locationReport);
    console.log(`Successfully created location report: ${locationReport}`);

    res.status(200).send('Ok');
  } catch (err) {
    console.error(`POST /location-reports failed with err: ${err}`);
    res.status(500).send(err.message);
  }
}

router.get('/:order_id', getLocationReports);
router.post('/', createLocationReport);

module.exports = router;
