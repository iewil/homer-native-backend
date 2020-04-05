// Imports
const express = require('express');

// Express
const router = express.Router();

async function ping(req, res) {
  res.status(200).send('Ok');
}

router.get('/', ping);

module.exports = router;
