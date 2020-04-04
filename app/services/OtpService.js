const _ = require('lodash');
const moment = require('moment');
const { Op } = require('sequelize');
const db = require('../src/models');
const { DbError } = require('../errors/DbErrors');

class OtpService {
  /**
   * @apiDescription Saves an OTP entry. The OTP entry contains a
   * email or contactNumber attribute, depending on whether the OTP
   * is being issued for an admin user.
   * @param {String} contactNumber - User's contact number
   * @param {String} email - User's email
   * @param {String} hashedOtp - Hash of generated OTP
   */
  static async saveOtp({ contactNumber, email, hashedOtp }) {
    try {
      await db.Otp.create({
        contact_number: contactNumber,
        email,
        otp: hashedOtp,
      });
    } catch (err) {
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
