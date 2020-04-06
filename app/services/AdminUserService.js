const _ = require('lodash');
const db = require('../src/models');

const ApplicationError = require('../errors/BaseError');
const { DbError } = require('../errors/DbErrors');

class AdminUserService {
  static async getUser(email) {
    // 1. Find if an admin user exists using their email
    const params = {
      where: {
        email,
      },
      order: [['createdAt', 'DESC']],
    };
    try {
      const result = await db.AdminUsers.findOne(params);
      if (_.isEmpty(result)) {
        throw new ApplicationError(`No users found for this email, ${email}`, 404);
      }
      return result;
    } catch (err) {
      if (err instanceof ApplicationError) {
        throw err;
      }
      throw new DbError('Db Error', err);
    }
  }
}

module.exports = AdminUserService;
