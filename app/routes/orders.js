// Imports
const express = require('express')
const router = express.Router()

const { v4: uuidv4 } = require('uuid')
const moment = require('moment')

// Services
const QuarantineOrderService = require('../services/QuarantineOrderService');

// Validators
const Ajv = require('ajv');
const ajv = new Ajv({
  format: 'full'
})
const { createQuarantineOrdersSchema, getQuarantineOrdersSchema, updateQuarantineOrdersSchema, invalidateQuarantineOrdersSchema } = require('../validators/quarantineOrders')

// Errors
const { InputSchemaValidationError } = require('../errors/InputValidationErrors')

async function getAllOrders (req, res) {
  try {
    const results = await QuarantineOrderService.getAllOrders()

    const orders = results.map(order => {
      return {
        orderId: order.id,
        contactNumber: order.contact_number,
        startDate: moment(order.start_date).format(),
        endDate: moment(order.end_date).format(),
      }
    })
    res.status(200).send({ orders })
  } catch (err) {
    res.status(500).send(err.message)
  }
};

async function getOrder (req, res) {
  try {
    let validRequest = ajv.validate(getQuarantineOrdersSchema, req)
    if (!validRequest) throw new InputSchemaValidationError(JSON.stringify(ajv.errors))

    const { contact_number: contactNumber } = req.params

    const result = await QuarantineOrderService.getLatestOrderByContactNumber(contactNumber)

    const order = {
      orderId: result.id,
      contactNumber: result.contact_number,
      startDate: moment(result.start_date).format(),
      endDate: moment(result.end_date).format(),
    }
    res.status(200).send(order)
  } catch (err) {
    res.status(500).send(err.message)
  }
};

async function createQuarantineOrder (req, res) {
  try {
    let validRequest = ajv.validate(createQuarantineOrdersSchema, req)
    if (!validRequest) throw new InputSchemaValidationError(JSON.stringify(ajv.errors))

    const {
      contact_number: contactNumber,
      start_date: startDateOnly,
      end_date: endDateOnly,
      photo_s3_key: photoS3Key
    } = req.body

    const orderID = `qo_${uuidv4()}`

    // Quarantine starts at midnight in local time
    let startDate = new Date(startDateOnly)
    startDate.setHours(0)
    // Quarantine ends at noon in local time
    let endDate = new Date(endDateOnly)
    endDate.setHours(12)

    const newOrder = {
      id: orderID,
      contact_number: contactNumber,
      start_date: startDate,
      end_date: endDate,
      photo_s3_key: photoS3Key
    }

    const result = await QuarantineOrderService.createOrder(newOrder)
    console.log(`Successfully created quarantine order: ${JSON.stringify(newOrder)}`)

    res.status(200).send(result)
  } catch (err) {
    res.status(500).send(err.message)
  }
};

async function updateOrder (req, res) {
  try {
    let validRequest = ajv.validate(updateQuarantineOrdersSchema, req)
    if (!validRequest) throw new InputSchemaValidationError(JSON.stringify(ajv.errors))

    const { order_id: orderId } = req.params

    const existing = await QuarantineOrderService.getOrderById(orderId)

    let { 
      start_date: newStartDateOnly, 
      end_date: newEndDateOnly,
      photo_s3_key: newPhotoS3Key
    } = req.body

    let newStartDate
    if (newStartDateOnly) {
      newStartDate = new Date(newStartDateOnly)
      newStartDate.setHours(0)
    }

    let newEndDate
    if (newEndDateOnly) {
      newEndDate = new Date(newEndDateOnly)
      newEndDate.setHours(12)
    }

    const updatedOrder = {
      contact_number: existing.contact_number,
      start_date: newStartDate || existing.start_date,
      end_date: newEndDate || existing.end_date,
      photo_s3_key: newPhotoS3Key || existing.photo_s3_key
    }

    const updated = await QuarantineOrderService.updateOrder(orderId, updatedOrder)
    res.status(200).send(updated)
  } catch (err) {
    res.status(500).send(err.message)
  }
};

async function invalidateOrder (req, res) {
  try {
    let validRequest = ajv.validate(invalidateQuarantineOrdersSchema, req)
    if (!validRequest) throw new InputSchemaValidationError(JSON.stringify(ajv.errors))

    const { order_id: orderId } = req.params

    const updated = await QuarantineOrderService.invalidateOrder(orderId)
    res.status(200).send(updated)
  } catch (err) {
    res.status(500).send(err.message)
  }
};

router.get('/', getAllOrders)
router.post('/', createQuarantineOrder)
router.get('/:contact_number', getOrder)
router.put('/:order_id', updateOrder)
router.put('/invalidate/:order_id', invalidateOrder)

module.exports = router;