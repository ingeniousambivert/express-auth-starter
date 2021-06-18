const mailer = require("nodemailer");
const { gmailUsername, gmailPassword } = require("../config");

const createVerifyMail = (email, userId, token, url) => {
  const link = `${url}/user/account/verify?userId=${userId}&token=${token}`;
  const mailOptions = {
    from: "no-reply@tellerblog.com",
    to: email,
    subject: "Account Verification",
    html: `Please verify your email by clicking this link - <a href="${link}" target="_blank">${link}</a>`,
  };
  return mailOptions;
};

const createForgotPasswordMail = (email, userId, token, url) => {
  const link = `${url}/user/account/reset?userId=${userId}&token=${token}`;
  const mailOptions = {
    from: "no-reply@tellerblog.com",
    to: email,
    subject: "Forgot Your Password",
    html: `Please reset your password by visiting this link - <a href="${link}" target="_blank">${link}</a>`,
  };
  return mailOptions;
};

const createPasswordResetMail = (email, type = "reset") => {
  const mailOptions = {
    from: "no-reply@tellerblog.com",
    to: email,
    subject: type === "reset" ? "Password Reset" : "Password Updated",
    html:
      type === "reset"
        ? "You have successfully reset your password"
        : "You have successfully updated your password",
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

const getIncrementDate = (increment) => {
  return new Date(new Date().setHours(new Date().getHours() + increment));
};

module.exports = {
  createVerifyMail,
  createForgotPasswordMail,
  createPasswordResetMail,
  mailTransporter,
  getIncrementDate,
};
