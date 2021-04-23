const mongoose = require("mongoose");
const { mongoUri } = require("./index");

mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("error", (error) => console.log(error));
mongoose.Promise = global.Promise;

module.exports = mongoose;
