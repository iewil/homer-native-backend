const { TABLE_ENV } = process.env;

const HOMER_NATIVE_OTP_TABLE = `homer-native-otp-${TABLE_ENV}`;
const HOMER_NATIVE_LOCATIONS_TABLE = `homer-native-locations-${TABLE_ENV}`;
const HOMER_NATIVE_USERS_TABLE = `homer-native-users-${TABLE_ENV}`;

const ALL_HOMER_USERS_TABLE = ['homer-native', 'mom-sho', 'ica-homer', 'moe-homer', 'mom-dloa', 'mom-fdw', 'mom-sho', 'homer'].map((prefix) => `${prefix}-users-${TABLE_ENV}`);

module.exports = {
  HOMER_NATIVE_OTP_TABLE,
  HOMER_NATIVE_LOCATIONS_TABLE,
  HOMER_NATIVE_USERS_TABLE,
  ALL_HOMER_USERS_TABLE,
};
