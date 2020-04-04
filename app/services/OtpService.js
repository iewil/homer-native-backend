const _ = require('lodash');
const moment = require('moment');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const db = require('../src/models');
const { DbError } = require('../errors/DbErrors');
const ApplicationError = require('../errors/BaseError');

const SALT_ROUNDS = 10;
class OtpService {
  /**
   * This creates an OTP for the given contact number.
   * To create the OTP; the following check is done:
   * - Check if the contact number is found in the quarantine orders table
   *    This is because we don't want people not on quarantine to use the app
   * @param {String} contactNumber - User's contact number
   */
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
      if (_.isEmpty(result)) {
        throw new ApplicationError(`No Quarantine Order with this number, ${contactNumber}, to create OTP for`, 404);
      }
      // 2. Generate OTP
      let otp;
      do {
        otp = crypto.randomBytes(3).toString('hex');
      }
      while (otp.match(/[a-z]/i));
      console.log(`Generated OTP ${otp} for ${contactNumber}`);

      // 3. Save OTP
      await db.Otp.create({
        contact_number: contactNumber,
        otp: bcrypt.hashSync(otp, SALT_ROUNDS),
      });
    } catch (err) {
      if (err instanceof ApplicationError) {
        throw err;
      }
      throw new DbError(err);
    }
  }

  /**
   * This fetches the latest OTP associated to the given `contactNumber`
   * and within the 15 minute expiry time
   * @param {String} contactNumber - User's contact number
   */
  static async getOtp(contactNumber) {
    const params = {
      where: {
        contact_number: contactNumber,
        createdAt: { // Get OTP that is within 15min of validity
          [Op.lte]: moment().add('15', 'minutes').format(),
        },
      },
      order: [['createdAt', 'DESC']],
    };
    try {
      const result = await db.Otp.findOne(params);
      if (_.isEmpty(result)) {
        return null;
      }
      return result.otp;
    } catch (err) {
      throw new DbError(err);
    }
  }
}

module.exports = OtpService;
