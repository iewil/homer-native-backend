// Imports
const express = require('express')
const router = express.Router()

// Middlewares
const { verifyJwt } = require('../middlewares/auth');

// Services
const { HealthReportService } = require('../services/HealthReportService')

// Validators
const Ajv = require('ajv');
const ajv = new Ajv()
const { getHealthReportsSchema, createHealthReportSchema } = require('../validators/healthReports')

// Errors
const { DbError } = require('../errors/DbErrors') 
const { InputSchemaValidationError } = require('../errors/InputValidationErrors')

async function getHealthReports (req, res) {
  try {
    // 1. Validate request
    let validRequest = ajv.validate(getHealthReportsSchema, req)
    if (!validRequest) throw new InputSchemaValidationError(JSON.stringify(ajv.errors))

    const { order_id: orderId } = req.params

    // 2. Find all locationReport objects that have the specified orderId
    let healthReportsForOrder
    try {
      healthReportsForOrder = await HealthReportService.getAllHealthReports(orderId)
      console.log(`Successfully obtained health reports for orderId: ${orderId}`) 
    } catch (err) {
      throw new DbError(err)
    }

    const healthReports = healthReportsForOrder.healthReports
    res.status(200).send({ healthReports })
  } catch (err) {
    console.error(`GET /health-reports failed with err: ${err}`)
    res.status(500).send(err.message)
  }
};

async function createHealthReport (req, res) {
  try {
    // 1. Validate request
    let validRequest = ajv.validate(createHealthReportSchema, req)
    if (!validRequest) throw new InputSchemaValidationError(JSON.stringify(ajv.errors))
    
    const { 
      temperature,
      cough,
      sore_throat: soreThroat,
      runny_nose: runnyNose,
      shortness_of_breath: shortnessOfBreath,
      photo_s3_key: photoS3Key,
      metadata
    } = req.body
    const orderId = req.orderId // Obtained from JWT in the auth middleware

    // 2. Store healthReport in the DB
    let healthReport = {
      order_id: orderId,
      temperature, 
      cough, 
      sore_throat: soreThroat, 
      runny_nose: runnyNose, 
      shortness_of_breath: shortnessOfBreath, 
      photo_s3_key: photoS3Key, 
      metadata
    }

    try {
      await HealthReportService.addHealthReport(healthReport)
      console.log(`Successfully created health report: ${JSON.parse(healthReport)}`) 
    } catch (err) {
      throw new DbError(err)
    }
    
    res.status(200).send('Ok')
  } catch (err) {
    console.error(`POST /health-reports failed with err: ${err}`)
    res.status(500).send(err.message)
  }
};

router.get('/:order_id', getHealthReports)
router.post('/', verifyJwt, createHealthReport)

module.exports = router;