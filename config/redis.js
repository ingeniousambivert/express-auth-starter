const redis = require("redis");
const { host } = require("./index");
const client = redis.createClient({
  port: 6379,
  host: host,
});

client.on("connect", () => {
  console.log("Redis client connected");
});

client.on("error", (err) => {
  console.log(err.message);
});

client.on("end", () => {
  console.log("Redis client disconnected");
});

process.on("SIGINT", () => {
  client.quit();
});

module.exports = client;
