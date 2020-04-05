const generateOtpSchema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        contact: {
          type: 'string',
        },
      },
      required: ['contact'],
    },
  },
  required: ['body'],
};

const verifyOtpSchema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        contact: {
          type: 'string',
        },
        otp: {
          type: 'string',
        },
      },
      required: ['contact', 'otp'],
    },
  },
  required: ['body'],
};

module.exports = {
  generateOtpSchema,
  verifyOtpSchema,
};
