# Homer Native Manual Send

Manually send notifications for quarantine orders on Homer

# Scripts
- 01_download_orders.js
  - Downloads all quarantine orders from the database into quaratine_orders.json (order_number, contact_number)
- 02_generate_notifications.js
  - Checks if push notification id exists for each quarantine order
  - writes pn.json for users registered for push notification
  - writes sms.json for users not registered for push notification
- 03a_send_location.js
  - define push notification message for location ping
  - define sms message for location ping
  - read pn.json
  - send push notifications
  - read sms.json
  - send smses
  - --force=true send sms to all
- 03b_send_photo.js
  - define push notification message for photo ping
  - define sms message for photo ping
  - read pn.json
  - send push notifications
  - read sms.json
  - send smses
  - --force=true send sms to all
- 03c_send_health_report.js
  - define push notification message for health report ping
  - define sms message for health report ping
  - read pn.json
  - send push notifications
  - read sms.json
  - send smses
  - --force=true send sms to all
