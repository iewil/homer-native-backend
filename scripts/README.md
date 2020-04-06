# Homer Native Manual Send

Manually send notifications for quarantine orders on Homer

# Scripts
- 01_download_orders.js
  - Downloads all quarantine orders from the database into quaratine_orders.json (order_number, contact_number)
- 02_generate_notifications.js
  - Checks if push notification id exists for each quarantine order
  - if it does, retrieves push notification token and sets type to push
  - if it does not, uses contact number and sets type to sms
- 03a_send_location.js
  - define push notification message for location ping
  - define sms message for location ping
  - send push notifications
  - send smses
- 03b_send_photo.js
  - define push notification message for photo ping
  - define sms message for photo ping
  - send push notifications
  - send smses
- 03b_send_health_report.js
  - define push notification message for health report ping
  - define sms message for health report ping
  - send push notifications
  - send smses
