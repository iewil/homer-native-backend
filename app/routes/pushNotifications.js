// Imports
const express = require('express')
const router = express.Router()

async function updatePushNotificationId (req, res) {
  // TO-DO: Verify JWT

  const { 
    push_notification_id: pushNotificationId,
    platform
  } = req.body

  try {
    // TO-DO

    res.status(200).send('Ok')
  } catch (err) {
    res.status(500).send(err.message)
  }
};

router.post('/', updatePushNotificationId)

module.exports = router;