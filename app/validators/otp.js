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
};

module.exports = {
  generateOtpSchema,
  verifyOtpSchema,
};
