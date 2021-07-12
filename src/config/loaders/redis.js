const redis = require("redis");
const logger = require("@helpers/logger");
const { redisConnection } = require("@config");

const client = redis.createClient(redisConnection);

client.on("connect", () => {
  console.log("Redis client connected");
});

client.on("error", (error) => {
  console.log("Redis client error");
  logger.error("Redis Client", error);
});

client.on("end", () => {
  console.log("Redis client disconnected");
});

process.on("SIGINT", () => {
  client.quit();
});

module.exports = client;
