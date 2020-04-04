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

  static async getAllLocationsForOrder(orderId) {
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
        // findOne because order IDs have a unique constraint in the DB
        result = await db.QuarantineOrders.findOne(query)
      } catch (err) {
        throw new DbError(err)
      }

      const data = result.dataValues
      const locations = data.LocationReports.map(report => {
        return report.dataValues
      })
      data.LocationReports = locations

      return data
    } catch (err) {
      throw err
    }
  }
}

module.exports = {
  LocationReportService
}