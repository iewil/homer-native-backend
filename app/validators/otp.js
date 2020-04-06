const generateOtpSchema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        contact_number: {
          type: 'string',
        },
        email: {
          type: 'string',
        },
      },
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
        contact_number: {
          type: 'string',
        },
        email: {
          type: 'string',
        },
        otp: {
          type: 'string',
        },
      },
      required: ['otp'],
    },
  },
  required: ['body'],
};

module.exports = {
  generateOtpSchema,
  verifyOtpSchema,
};
