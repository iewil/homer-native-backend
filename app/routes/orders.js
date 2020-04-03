// Imports
const express = require('express')
const router = express.Router()

async function getAllOrders (req, res) {
  const { order_id: orderId } = req.params
  try {
    // TO-DO

    let orders
    res.status(200).send({ orders })
  } catch (err) {
    res.status(500).send(err.message)
  }
};

async function getOneOrder (req, res) {
  const { order_id: orderId } = req.params
  try {
    // TO-DO

    const response = {
      contact_number: contactNumber, 
      photo_s3_key: photoS3Key, 
      start_date: startDate, 
      end_date: endDate, 
      timestamp
    }
    res.status(200).send(response)
  } catch (err) {
    res.status(500).send(err.message)
  }
};

async function createOrder (req, res) {
  const { 
    contact_number: contactNumber, 
    photo_s3_key: photoS3Key, 
    start_date: startDate, 
    end_date: endDate, 
  } = req.body

  try {
    // TO-DO
    res.status(200).send('Ok')
  } catch (err) {
    res.status(500).send(err.message)
  }
};

async function updateOrder (req, res) {
  const { 
    contact_number: contactNumber, 
    photo_s3_key: photoS3Key, 
    start_date: startDate, 
    end_date: endDate, 
  } = req.body

  try {
    // TO-DO
    res.status(200).send('Ok')
  } catch (err) {
    res.status(500).send(err.message)
  }
};

router.get('/', getAllOrders)
router.post('/', createOrder)
router.get('/:order_id', getOneOrder)
router.post('/:order_id', updateOrder)

module.exports = router;