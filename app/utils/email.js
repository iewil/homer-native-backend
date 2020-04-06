// Imports
const nodemailer = require('nodemailer');
const AWS = require('aws-sdk');

// Constants
const { NODE_ENV } = process.env;
const AWS_SES_REGION = 'us-west-2';

async function sendEmail(nodemailerOptions) {
  if (NODE_ENV === 'production' || NODE_ENV === 'staging') {
    const transporter = nodemailer.createTransport({
      SES: new AWS.SES({ region: AWS_SES_REGION }),
    });
    return transporter.sendMail(nodemailerOptions);
  }
  // Stub email service if not production or staging
  return new Promise((resolve) => resolve('mail sent'));
}

async function sendOtpEmail(adminUserEmail, otp) {
  const emailTemplate = `
    <p>Hi ${adminUserEmail},</p>
    <p>Here is your One Time Password to log in to Homer:</p>
    <p><b>${otp}</b></p>
    <p>The OTP will expire in 15 mins and can only be used once</p>
  `;
  const otpMessage = {
    to: adminUserEmail,
    from: 'homer.gov.sg <donotreply@mail.homer.gov.sg>',
    subject: 'Homer - OTP Verification',
    html: emailTemplate,
  };

  return sendEmail(otpMessage);
}

module.exports = { sendOtpEmail };
