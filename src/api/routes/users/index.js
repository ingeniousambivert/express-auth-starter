const express = require("express");
const { secureRoute } = require("@api/middlewares");
const { GetUser, UpdateUser, DeleteUser } = require("@api/controllers/users");

const route = express.Router();

module.exports = (app) => {
  app.use("/users", route);

  route.get("/:id", secureRoute, GetUser);

  route.patch("/:id", secureRoute, UpdateUser);

  route.delete("/:id", secureRoute, DeleteUser);
};
