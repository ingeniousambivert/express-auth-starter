const logger = require("@helpers/logger");

module.exports = (userService) => {
  userService.on("user.error", async (error) => {
    logger.error(`events:user:user.error: ${error}`);
  });
};
