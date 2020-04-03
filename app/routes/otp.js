// Imports
const express = require('express')
const router = express.Router()

async function generateOtp (req, res) {
  const { contact_number: contactNumber } = req.body;
  try {
    // TO-DO
    let otp
    res.status(200).send({ otp })
  } catch (err) {
    res.status(500).send(err.message)
  }
};

async function verifyOtp (req, res) {
  const { contact_number: contactNumber, otp } = req.body;
  try {
    // TO-DO
    let accessToken
    res.status(200).send({ access_token: accessToken })
  } catch (err) {
    res.status(500).send(err.message)
  }
};

router.post('/generate', generateOtp)
router.post('/verify', verifyOtp)

module.exports = router;