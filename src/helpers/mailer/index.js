const mailer = require("nodemailer");
const { gmailUsername, gmailPassword, clientUrl: url } = require("@config");

const createVerifyMail = (email, userId, token) => {
  const link = `${url}/user/account/verify?userId=${userId}&token=${token}`;
  const mailOptions = {
    from: "no-reply@company.com",
    to: email,
    subject: "Account Verification",
    html: `Please verify your email by clicking this link - <a href="${link}" target="_blank">${link}</a>`,
  };
  return mailOptions;
};

const createForgotPasswordMail = (email, userId, token) => {
  const link = `${url}/user/account/reset?userId=${userId}&token=${token}`;
  const mailOptions = {
    from: "no-reply@company.com",
    to: email,
    subject: "Forgot Your Password",
    html: `Please reset your password by visiting this link - <a href="${link}" target="_blank">${link}</a>`,
  };
  return mailOptions;
};

const createPasswordResetMail = (email) => {
  const mailOptions = {
    from: "no-reply@company.com",
    to: email,
    subject: "Password Reset",
    html: "You have successfully reset your password",
  };
  return mailOptions;
};

const createPasswordUpdateMail = (email) => {
  const mailOptions = {
    from: "no-reply@company.com",
    to: email,
    subject: "Password Updated",
    html: "You have successfully updated your password",
  };
  return mailOptions;
};

const mailTransporter = mailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUsername,
    pass: gmailPassword,
  },
});

module.exports = {
  createVerifyMail,
  createForgotPasswordMail,
  createPasswordResetMail,
  createPasswordUpdateMail,
  mailTransporter,
};
