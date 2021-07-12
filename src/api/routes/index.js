const express = require("express");
const authRouter = require("@api/routes/auth");
const usersRouter = require("@api/routes/users");

const app = express.Router();

module.exports = () => {
  authRouter(app);
  usersRouter(app);
  return app;
};
