const logger = require("@helpers/logger");

module.exports = (options) => {
  const userService = options;

  userService.on("user.error", async (error) => {
    logger.error(`events:user:user.error: ${error}`);
  });
};
