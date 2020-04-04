// Imports
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const router = express.Router();
const OtpService = require('../services/OtpService');
const QuarantineOrderService = require('../services/QuarantineOrderService');

const SALT_ROUNDS = 10;

async function generateOtp(req, res) {
  const { contact_number: contactNumber } = req.body;
  try {
    // 1. Check if user is on a quarantine order before issuing OTP
    await QuarantineOrderService.getLatestOrderByContactNumber(contactNumber);
    // 2. Generate OTP
    let otp;
    do {
      otp = crypto.randomBytes(3).toString('hex');
    }
    while (otp.match(/[a-z]/i));
    console.log(`Generated OTP ${otp} for ${contactNumber}`);

    const hashedOtp = bcrypt.hashSync(otp, SALT_ROUNDS);
    await OtpService.saveOtp(contactNumber, hashedOtp);
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
