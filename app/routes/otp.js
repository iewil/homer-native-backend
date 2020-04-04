// Imports
const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();
const OtpService = require('../services/OtpService');

async function generateOtp(req, res) {
  const { contact_number: contactNumber } = req.body;
  try {
    await OtpService.createOtp(contactNumber);
    res.status(200).send({ message: 'OTP created' });
  } catch (err) {
    res.status(500).send(err.message);
  }
}

async function verifyOtp(req, res) {
  const { contact_number: contactNumber, otp } = req.body;
  try {
    const retrievedOtp = await OtpService.getOtp(contactNumber);
    if (bcrypt.compareSync(otp, retrievedOtp)) {
      res.status(200).send({ access_token: 'Access token!' });
    } else {
      res.status(400).send('Invalid OTP');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
}

router.post('/generate', generateOtp);
router.post('/verify', verifyOtp);

module.exports = router;
