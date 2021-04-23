const express = require("express");
const { secureRoute } = require("../auth");
const {
  createUser,
  authenticateUser,
  getUser,
} = require("../controllers/users");

const router = express.Router();

router.post("/signup", createUser);

router.post("/signin", authenticateUser);

router.get("/:id", secureRoute, getUser);

module.exports = router;
