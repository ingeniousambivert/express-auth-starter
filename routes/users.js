const express = require("express");
const { secureRoute } = require("../auth");
const {
  createUser,
  authenticateUser,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");

const router = express.Router();

router.post("/signup", createUser);

router.post("/signin", authenticateUser);

router.get("/:id", secureRoute, getUser);

router.post("/update/:id", secureRoute, updateUser);

router.post("/delete/:id", secureRoute, deleteUser);

module.exports = router;
