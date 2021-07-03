const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { mongoUri } = require("./index");

mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Mongoose client connected");
});

mongoose.connection.on("error", (error) => {
  logger.error(`${error.message}`);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose client disconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
mongoose.Promise = global.Promise;

module.exports = mongoose;
