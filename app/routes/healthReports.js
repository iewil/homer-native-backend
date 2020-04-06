// Imports
const express = require('express');

const router = express.Router();

// Middlewares
const Ajv = require('ajv');

// Services
const { HealthReportService } = require('../services/HealthReportService');

// Validators
const ajv = new Ajv();
const { getHealthReportsSchema, createHealthReportSchema } = require('../validators/healthReports');

// Errors
const { DbError } = require('../errors/DbErrors');
const { UnauthorisedActionError } = require('../errors/AuthErrors');
const { InputSchemaValidationError } = require('../errors/InputValidationErrors');

async function getHealthReports(req, res) {
  try {
    // 1. Validate request
    const validRequest = ajv.validate(getHealthReportsSchema, req);
    if (!validRequest) throw new InputSchemaValidationError(JSON.stringify(ajv.errors));

    const { order_id: orderId } = req.params;

    if ((req.orderId && req.orderId === orderId) || req.role === 'admin') {
      // 2. Find all locationReport objects that have the specified orderId
      let healthReportsForOrder;
      try {
        healthReportsForOrder = await HealthReportService.getAllHealthReports(orderId);
        console.log(`Successfully obtained health reports for orderId: ${orderId}`);
      } catch (err) {
        throw new DbError(err);
      }

      const { healthReports } = healthReportsForOrder;
      res.status(200).send({ health_reports: healthReports });
    } else {
      throw new UnauthorisedActionError('get health reports', orderId);
    }
  } catch (err) {
    console.error(err.status ? `GET /health-reports/:order_id failed with err: ${JSON.stringify(err)}` : `GET /health-reports/:order_id unhandled server error: ${JSON.stringify(err)}`);
    return res.status(err.status ? err.status : 500).send(`${err.name}: ${err.message}`);
  }
}

async function createHealthReport(req, res) {
  try {
    // 1. Validate request
    const validRequest = ajv.validate(createHealthReportSchema, req);
    if (!validRequest) throw new InputSchemaValidationError(JSON.stringify(ajv.errors));

    const {
      temperature,
      cough,
      sore_throat: soreThroat,
      runny_nose: runnyNose,
      shortness_of_breath: shortnessOfBreath,
      photo_s3_key: photoS3Key,
      metadata,
    } = req.body;
    const { orderId } = req; // Obtained from JWT in the auth middleware

    // 2. Store healthReport in the DB
    const healthReport = {
      order_id: orderId,
      temperature,
      cough,
      sore_throat: soreThroat,
      runny_nose: runnyNose,
      shortness_of_breath: shortnessOfBreath,
      photo_s3_key: photoS3Key,
      metadata,
    };

    try {
      await HealthReportService.addHealthReport(healthReport);
      console.log(`Successfully created health report: ${healthReport}`);
    } catch (err) {
      throw new DbError(err);
    }

    return res.status(200).send('Ok');
  } catch (err) {
    console.error(err.status ? `POST /health-reports failed with err: ${JSON.stringify(err)}` : `POST /health-reports unhandled server error: ${JSON.stringify(err)}`);
    return res.status(err.status ? err.status : 500).send(`${err.name}: ${err.message}`);
  }
}

router.get('/:order_id', getHealthReports);
router.post('/', createHealthReport);

module.exports = router;
