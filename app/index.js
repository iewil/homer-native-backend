const express = require('express');
const cors = require('cors');

const { PORT } = process.env;
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development'

const db = require('./src/models')
const { verifyJwt } = require('./middlewares/auth')

const app = express();
app.use(express.json());

// Middlewares
// const auth = require('./middlewares/auth');

// // This wraps around request handlers so that any error
// // is passed on to the general error handler
// const withErrorHandler = (func) => (res, req, next) => {
//   func(res, req).catch(next);
// };
// const ApplicationError = require('./errors/BaseError');

// app.use(async (err, req, res, next) => {
//   if (err instanceof ApplicationError) {
//     console.log(err.name, err.message);
//     res.status(err.status).json({
//       error: err.name,
//       message: err.message,
//     });
//   } else {
//     console.log('Unaccounted error: ', err.stack);
//     res.status(500).json({
//       error: 'Unexpected Server Error',
//       message: 'An Unexpected error has occured',
//     });
//   }
//   console.groupEnd();
// });

// Import routes
const healthReportsRouter = require('./routes/healthReports')
const locationReportsRouter = require('./routes/locationReports')
const ordersRouter = require('./routes/orders')
const otpRouter = require('./routes/otp')
const photosRouter = require('./routes/photos')
const pushNotificationsRouter = require('./routes/pushNotifications')

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// For ELB health check
app.get('/ping', (req, res) => res.status(200).json({ message: 'pong' }));

app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use('/otp', otpRouter);

// Auth middleware
app.use(verifyJwt);

// Protected routes
app.use('/health-reports', healthReportsRouter);
app.use('/location-reports', locationReportsRouter);
app.use('/push-notifications', pushNotificationsRouter);
app.use('/orders', ordersRouter);
app.use('/photos', photosRouter);

db.sequelize.sync().then(() => {
  console.log(`DB connection successful, env: ${env}`)
  app.listen(PORT, () => console.log(`Native Homer backend app listening on port ${PORT}`));
})

module.exports = app;
