const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const configJson = require('../config/config')

const basename = path.basename(__filename)
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development'

const {
  DB_NAME,
  DB_USER,
  DB_PASS,
  DB_HOST
} = process.env

const config = configJson[env]

console.log('this is the environment: ', env)

const db = {}

let sequelize

if (env === 'development') {
  sequelize = new Sequelize(
    process.env[config.use_env_variable], config
  )
} else {
  const DB_URL = `${DB_NAME}://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}`
  sequelize = new Sequelize(DB_URL)
}

fs
  .readdirSync(__dirname)
  .filter((file) => {
    return (file.indexOf('.') !== 0) && 
           (file !== basename) && (file.slice(-3) === '.js')
  })
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
  })

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db