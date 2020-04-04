require('dotenv').config()

module.exports = {
  development: {
    // online dev database
    use_env_variable: 'DATABASE_URL',
    // database: 'homer_native_dev',
    // username: 'example',
    // password: null,
    // host: '127.0.0.1',
    dialect: 'postgres'
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
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOption: {
      // ssl: true,
      native: true
    },
    logging: true
  },

  production: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOption: {
      // ssl: true,
      native: true
    },
    logging: true
  }
}
