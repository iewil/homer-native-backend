const { Op } = require('sequelize');
const _ = require('lodash');
const db = require('../src/models');

const ApplicationError = require('../errors/BaseError');
const { DbError } = require('../errors/DbErrors');

class QuarantineOrderService {
  static async createOrder(newOrder) {
    try {
      return await db.QuarantineOrders.create(newOrder);
    } catch (err) {
      throw new DbError(err);
    }
  }


  static async getOrderById(orderId) {
    try {
      const params = {
        where: {
          id: orderId,
        },
      };
      const result = await db.QuarantineOrders.findOne(params);
      if (_.isEmpty(result)) {
        throw new ApplicationError(`No users were found for this order, ${orderId}`, 404);
      }
      return result;
    } catch (err) {
      throw new DbError(err);
    }
  }

  static async getAllOrders() {
    try {
      return await db.QuarantineOrders.findAll();
    } catch (err) {
      throw new DbError(err);
    }
  }

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
      return result;
    } catch (err) {
      if (err instanceof ApplicationError) {
        throw err;
      }
      throw new DbError('Db Error', err);
    }
  }

  static async updateOrder(orderId, updatedOrder) {
    try {
      const params = {
        where: {
          id: orderId
        }
      }
      return await db.QuarantineOrders.update(updatedOrder, params)
    } catch (err) {
      throw new DbError(err)
    }
  }

  static async invalidateOrder(orderId) {
    try {
      const params = {
        where: {
          id: orderId
        }
      }
      // Invalidate order by setting start and end date to start of unix epoch
      const invalidDate = new Date('1970-01-01')
      return await db.QuarantineOrders.update({
        start_date: invalidDate,
        end_date: invalidDate
      }, params)
    } catch (err) {
      throw new DbError(err)
    }
  }
}

module.exports = QuarantineOrderService;