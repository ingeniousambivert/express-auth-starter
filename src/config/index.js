const dotenv = require("dotenv");
const assert = require("assert");
dotenv.config();

const {
  NODE_ENV,
  PORT,
  MONGO_PORT,
  MONGO_DATABASE,
  MONGO_HOST,
  MONGO_USERNAME,
  MONGO_PASSWORD,
  REDIS_PORT,
  REDIS_HOST,
  REDIS_PASSWORD,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  GMAIL_USERNAME,
  GMAIL_PASSWORD,
  CLIENT_URL,
  API_PREFIX,
  EXPIRY_AFTER,
} = process.env;

assert(ACCESS_TOKEN_SECRET, "ACCESS_TOKEN_SECRET is required");
assert(REFRESH_TOKEN_SECRET, "REFRESH_TOKEN_SECRET is required");
assert(GMAIL_USERNAME, "GMAIL_USERNAME is required");
assert(GMAIL_PASSWORD, "GMAIL_PASSWORD is required");
assert(CLIENT_URL, "CLIENT_URL is required");

if (!PORT) {
  PORT = 8000;
}
if (!MONGO_PORT) {
  MONGO_PORT = 27017;
}
if (!MONGO_HOST) {
  MONGO_HOST = "127.0.0.1";
}
if (!MONGO_DATABASE) {
  MONGO_DATABASE = "express-starter";
}
if (!REDIS_PORT) {
  REDIS_PORT = 6379;
}
if (!REDIS_HOST) {
  REDIS_HOST = "127.0.0.1";
}
if (!API_PREFIX) {
  API_PREFIX = "/api";
}
if (!EXPIRY_AFTER) {
  EXPIRY_AFTER = "1d";
}

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

function constructMongoURI(port, host, database, username, password) {
  if (username && password) {
    return `mongodb://${username}:${password}@${host}:${port}/${database}`;
  } else {
    return `mongodb://${host}:${port}/${database}`;
  }
}

function constructRedisConnection(port, host, password) {
  if (password) {
    return { port, host, password };
  } else {
    return { port, host };
  }
}

const config = {
  env: NODE_ENV,
  port: normalizePort(PORT),
  mongoUri: constructMongoURI(
    MONGO_PORT,
    MONGO_HOST,
    MONGO_DATABASE,
    MONGO_USERNAME,
    MONGO_PASSWORD
  ),
  redisConnection: constructRedisConnection(
    REDIS_PORT,
    REDIS_HOST,
    REDIS_PASSWORD
  ),
  accessSecret: ACCESS_TOKEN_SECRET,
  refreshSecret: REFRESH_TOKEN_SECRET,
  gmailUsername: GMAIL_USERNAME,
  gmailPassword: GMAIL_PASSWORD,
  clientUrl: CLIENT_URL,
  apiPrefix: API_PREFIX,
  jwtExpiry: EXPIRY_AFTER,
};

module.exports = config;
