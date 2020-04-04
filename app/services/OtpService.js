const _ = require('lodash');
const { Op } = require('sequelize');
const db = require('../src/models');
const { DbError } = require('../errors/DbErrors');

class OtpService {
  static async createOtp(contactNumber) {
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
      if (_.isEmpty(result)) throw new Error('No Quarantine Order for the given contact number');

      // 2. Generate OTP
      let otp;
      do {
        otp = crypto.randomBytes(3).toString('hex');
      }
      while (otp.match(/[a-z]/i));

      // 3. Save OTP
      await db.Otp.create({
        contact_number: contactNumber,
        otp,
      });
    } catch (err) {
      throw new DbError(err);
    }
  }
}

module.exports = OtpService;
