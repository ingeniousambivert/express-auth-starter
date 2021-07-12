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
            logger.error("MailerService.verifyEmail", error);
            reject(false);
          }
          break;
        case "resetPassword":
          try {
            const { email } = data;
            const mailOptions = createPasswordResetMail(email);
            await mailTransporter.sendMail(mailOptions);
            resolve(true);
          } catch (error) {
            logger.error("MailerService.resetPassword", error);
            reject(false);
          }
          break;
        case "forgotPassword":
          try {
            const { email, id, token } = data;
            const mailOptions = createForgotPasswordMail(email, id, token);
            await mailTransporter.sendMail(mailOptions);
            resolve(true);
          } catch (error) {
            logger.error("MailerService.forgotPassword", error);
            reject(false);
          }
          break;
        case "updatePassword":
          try {
            const { email } = data;
            const mailOptions = createPasswordUpdateMail(email);
            await mailTransporter.sendMail(mailOptions);
            resolve(true);
          } catch (error) {
            logger.error("MailerService.updatePassword", error);
            reject(false);
          }
          break;

        default:
          break;
      }
    });
  }
}

module.exports = MailerService;
