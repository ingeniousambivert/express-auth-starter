const logger = require("@helpers/logger");
const MailerService = require("@services/mailer");
const mailerService = new MailerService();

module.exports = (authService, UserModel) => {
  authService.on("auth:signup", async (params) => {
    try {
      const { email, id, token, type } = params;
      await mailerService.Send({ email, id, token }, type);
    } catch (error) {
      logger.error(`events:auth:signup: ${error}`);
    }
  });

  authService.on("auth:signin", async (params) => {
    try {
      const id = params;
      await UserModel.findByIdAndUpdate(
        id,
        { lastLogin: new Date() },
        { new: true }
      );
    } catch (error) {
      logger.error(`events:auth:signin: ${error}`);
    }
  });

  authService.on("auth:error", async (error) => {
    logger.error(`events:auth:error: ${error}`);
  });
};
