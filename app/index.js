// Utility modules
const jsonfile = require('jsonfile')

const express = require('express');
const cors = require('cors');

const { PORT } = process.env;
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development'

// Create a Secrets Manager client
const AWS = require('aws-sdk');

const AWS_REGION = 'ap-southeast-1';
const secretsClient = new AWS.SecretsManager({
  region: AWS_REGION,
});
const firebaseCredentialsSecretName = 'homer-native-firebase-credentials';

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
app.use('/orders', ordersRouter);
app.use('/photos', photosRouter);

async function loadFirebaseCredentials() {
  try {
    const secret = await secretsClient.getSecretValue({
      SecretId: firebaseCredentialsSecretName,
    }).promise();
    const firebaseCredentialLocation = './app/services/NotificationService/firebase-service-account.json';
    jsonfile.writeFileSync(
      firebaseCredentialLocation,
      JSON.parse(secret.SecretString),
      { spaces: 2 },
    );
  } catch (error) {
    console.log('error occured while trying to load firebase secret', error);
    throw error;
  }
}

async function startServer() {
  // Connect to db
  await db.sequelize.sync();
  console.log(`DB connection successful, env: ${env}`);

  // Load firebase credentials
  await loadFirebaseCredentials();

  // Bind the push notification route
  const pushNotificationsRouter = require('./routes/pushNotifications');
  app.use('/push-notifications', pushNotificationsRouter);

  // Start the server by listening
  app.listen(PORT, () => console.log(`Native Homer backend app listening on port ${PORT}`));
}

startServer();

module.exports = app;
