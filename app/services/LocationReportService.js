const db = require('../src/models')
const _ = require('lodash')

// Errors
const { DbError } = require('../errors/DbErrors')

class LocationReportService {
  static async addLocationReport(newReport) {
    try{
      return await db.LocationReports.create(newReport)
    } catch (err) {
      throw new DbError(err)
    }
  }

  static async getAllLocationReports(orderId) {
    try {
      const query = {
        where: {
          id: orderId,
        }, 
        include: [{
          model: db.LocationReports,
          as: 'LocationReports'
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
  LocationReportService
}