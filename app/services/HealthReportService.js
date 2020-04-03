const db = require('../src/models')
const _ = require('lodash')

// Errors
const { DbError } = require('../errors/DbErrors')


class HealthReportService {
  static async addHealthReport(newReport) {
    try{
      return await db.HealthReports.create(newReport)
    } catch (err) {
      throw new DbError(err)
    }
  }

  static async getAllHealthReports(orderId) {
    try {
      const query = {
        where: {
          id: orderId,
        }, 
        include: [{
          model: db.HealthReports,
          as: 'HealthReports'
        }]
      }

      let result
      try {
        result = await db.QuarantineOrders.findAll(query)
      } catch (err) {
        throw new DbError(err)
      }

      return result
    } catch (err) {
      throw err
    }
  }
}

module.exports = {
  HealthReportService
}