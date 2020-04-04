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
        // findOne because order IDs have a unique constraint in the DB
        result = await db.QuarantineOrders.findOne(query)
      } catch (err) {
        throw new DbError(err)
      }

      const data = result.dataValues

      // Flatten locationReports
      const healthReports = data.HealthReports.map(report => {
        return report.dataValues
      })

      const healthReportsForOrder = {
        orderId: data.id,
        contactNumber: data.contact_number,
        startDate: data.start_date,
        endDate: data.end_date,
        photoS3Key: data.photo_s3_key,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        healthReports: healthReports
      }

      return healthReportsForOrder
    } catch (err) {
      throw err
    }
  }
}

module.exports = {
  HealthReportService
}