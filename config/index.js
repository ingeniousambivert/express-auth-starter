const dotenv = require("dotenv");
const assert = require("assert");

dotenv.config();

const {
  NODE_ENV,
  PORT,
  HOST,
  SEQUELIZE_DIALECT,
  POSTGRES_DATABASE,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  GMAIL_USERNAME,
  GMAIL_PASSWORD,
  CLIENT_URL,
} = process.env;

assert(PORT, "PORT is required");
assert(HOST, "HOST is required");
assert(SEQUELIZE_DIALECT, "SEQUELIZE_DIALECT is required");
assert(POSTGRES_DATABASE, "POSTGRES_DATABASE is required");
assert(POSTGRES_USER, "POSTGRES_USER is required");
assert(ACCESS_TOKEN_SECRET, "ACCESS_TOKEN_SECRET is required");
assert(REFRESH_TOKEN_SECRET, "REFRESH_TOKEN_SECRET is required");

module.exports = {
  env: NODE_ENV,
  port: PORT,
  host: HOST,
  sequelizeDialect: SEQUELIZE_DIALECT,
  postgresDatabase: POSTGRES_DATABASE,
  postgresUser: POSTGRES_USER,
  postgresPassword: POSTGRES_PASSWORD,
  accessSecret: ACCESS_TOKEN_SECRET,
  refreshSecret: REFRESH_TOKEN_SECRET,
  gmailUsername: GMAIL_USERNAME,
  gmailPassword: GMAIL_PASSWORD,
  clientUrl: CLIENT_URL,
};
