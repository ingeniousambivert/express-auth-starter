require("module-alias/register");

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const requestLogger = require("morgan");
const appRoutes = require("@api/routes");
const { apiPrefix } = require("@config");

require("@config/loaders/mongoose");

const app = express();

app.use(requestLogger("dev"));
app.use(express.json());
app.enable("trust proxy");
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/status", (req, res) => {
  res.status(200).end();
});
app.use(apiPrefix, appRoutes());

module.exports = app;
