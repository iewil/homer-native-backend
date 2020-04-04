const { Op } = require('sequelize');
const _ = require('lodash');
const db = require('../src/models');

const ApplicationError = require('../errors/BaseError');
const { DbError } = require('../errors/DbErrors');

class QuarantineOrderService {
  static async getLatestOrderByContactNumber(contactNumber) {
    // 1. Find if a quarantine order exists for the given contact number
    const params = {
      where: {
        contact_number: contactNumber,
        [Op.and]: [ // check that order falls within the start and end date
          {
            start_date: {
              [Op.lte]: new Date(),
            },
          },
          {
            end_date: {
              [Op.gte]: new Date(),
            },
          },
        ],
      },
      order: [['createdAt', 'DESC']],
    };
    try {
      const result = await db.QuarantineOrders.findOne(params);
      if (_.isEmpty(result)) {
        throw new ApplicationError(`No Quarantine Order found for this number, ${contactNumber}`, 404);
      }
      return result.order_id;
    } catch (err) {
      if (err instanceof ApplicationError) {
        throw err;
      }
      throw new DbError('Db Error', err);
    }
  }
}

module.exports = QuarantineOrderService;
