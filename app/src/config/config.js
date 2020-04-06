require('dotenv').config()

module.exports = {
  development: {
    // online dev database
    use_env_variable: 'DATABASE_URL',
    // database: 'homer_native_dev',
    // username: 'example',
    // password: null,
    // host: '127.0.0.1',
    dialect: 'postgres',
    dialectOptions: {
      useUTC: false, // for reading from database,
      timezone: '+08:00'
    },
    timezone: '+08:00' // for writing to database
  },

  test: {
    database: 'homer_native_test',
    username: 'example',
    password: null,
    host: '127.0.0.1',
    dialect: 'postgres'
  },

  staging: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOption: {
      // ssl: true,
      native: true,
      useUTC: false, // for reading from database
      timezone: '+08:00'
    },
    timezone: '+08:00', // for writing to database
    logging: true
  },

  production: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOption: {
      // ssl: true,
      native: true,
      useUTC: false, // for reading from database
      timezone: '+08:00'
    },
    timezone: '+08:00', // for writing to database
    logging: true
  }
}
