const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("morgan");
require("./config/mongoose");

const usersRouter = require("./routes/users");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/users", usersRouter);

module.exports = app;
