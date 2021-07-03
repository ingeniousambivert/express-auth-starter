const dotenv = require("dotenv");
const assert = require("assert");

dotenv.config();

const {
  NODE_ENV,
  PORT,
  MONGO_URI,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  GMAIL_USERNAME,
  GMAIL_PASSWORD,
  CLIENT_URL,
} = process.env;

assert(PORT, "PORT is required");
assert(MONGO_URI, "MONGO URI is required");
assert(ACCESS_TOKEN_SECRET, "ACCESS_TOKEN_SECRET is required");
assert(REFRESH_TOKEN_SECRET, "REFRESH_TOKEN_SECRET is required");

module.exports = {
  env: NODE_ENV,
  port: PORT,
  mongoUri: MONGO_URI,
  accessSecret: ACCESS_TOKEN_SECRET,
  refreshSecret: REFRESH_TOKEN_SECRET,
  gmailUsername: GMAIL_USERNAME,
  gmailPassword: GMAIL_PASSWORD,
  clientUrl: CLIENT_URL,
};
