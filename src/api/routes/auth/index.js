const express = require("express");
const { secureRoute } = require("@api/middlewares");
const {
  SignupUser,
  SigninUser,
  RefreshAccess,
  RevokeAccess,
} = require("@api/controllers/auth");

const route = express.Router();

module.exports = (app) => {
  app.use("/auth", route);

  route.post("/signup", SignupUser);

  route.post("/signin", SigninUser);

  route.post("/refresh", secureRoute, RefreshAccess);

  route.delete("/signout", secureRoute, RevokeAccess);
};
