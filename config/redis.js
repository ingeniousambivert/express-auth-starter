const redis = require("redis");
const logger = require("../utils/logger");

const client = redis.createClient({
  port: 6379,
  host: "127.0.0.1",
});

client.on("connect", () => {
  console.log("Redis client connected");
});

client.on("error", (error) => {
  logger.error(`${error.message}`);
});

client.on("end", () => {
  console.log("Redis client disconnected");
});

process.on("SIGINT", () => {
  client.quit();
});

module.exports = client;
