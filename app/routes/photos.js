// Imports
const express = require('express')
const router = express.Router()

async function uploadPhotoToS3 (req, res) {
  const { photo } = req.body
  try {
    // TO-DO

    const photoS3Key
    res.status(200).send({ photo_s3_key: photoS3Key })
  } catch (err) {
    res.status(500).send(err.message)
  }
};

router.post('/', uploadPhotoToS3)

module.exports = router;