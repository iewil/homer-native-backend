const db = require('../src/models')
const { Sequelize } = require('sequelize')

class LocationReportService {
  static async addLocationReport(newReport) {
    try{
      return await db.LocationReports.create(newReport)
    } catch (err) {
      throw err
    }
  }

  static async getAllLocations(order_id) {
    try {
      const query = {
        where: {
          id: order_id,
        }, 
        include: [{
          model: db.LocationReports,
          as: 'LocationReports'
        }]
      }

      const result = await db.QuarantineOrders.findOne(query)

      console.log("RESULT HERE", result.dataValues)
      return result.dataValues
    } catch (err) {
      throw err
    }
  }
}

module.exports = {
  LocationReportService
}