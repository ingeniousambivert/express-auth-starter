const logger = require("@helpers/logger");
const {
  createVerifyMail,
  createForgotPasswordMail,
  createPasswordResetMail,
  createPasswordUpdateMail,
  mailTransporter,
} = require("@helpers/mailer");

class MailerService {
  async Send(data, type) {
    return new Promise(async (resolve, reject) => {
      switch (type) {
        case "verifyEmail":
          try {
            const { email, id, token } = data;
            const mailOptions = createVerifyMail(email, id, token);
            await mailTransporter.sendMail(mailOptions);
            resolve(true);
          } catch (error) {
            logger.error("service:mailer:verifyEmail:", error);
            reject(error.message);
          }
          break;
        case "resetPassword":
          try {
            const { email } = data;
            const mailOptions = createPasswordResetMail(email);
            await mailTransporter.sendMail(mailOptions);
            resolve(true);
          } catch (error) {
            logger.error("service:mailer:resetPassword:", error);
            reject(error.message);
          }
          break;
        case "forgotPassword":
          try {
            const { email, id, token } = data;
            const mailOptions = createForgotPasswordMail(email, id, token);
            await mailTransporter.sendMail(mailOptions);
            resolve(true);
          } catch (error) {
            logger.error("service:mailer:forgotPassword:", error);
            reject(error.message);
          }
          break;
        case "updatePassword":
          try {
            const { email } = data;
            const mailOptions = createPasswordUpdateMail(email);
            await mailTransporter.sendMail(mailOptions);
            resolve(true);
          } catch (error) {
            logger.error("service:mailer:updatePassword:", error);
            reject(error.message);
          }
          break;

        default:
          break;
      }
    });
  }
}

module.exports = MailerService;
