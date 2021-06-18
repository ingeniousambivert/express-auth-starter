const express = require("express");
const { secureRoute } = require("../auth");
const {
  createUser,
  authenticateUser,
  refreshUserAccess,
  revokeUserAccess,
  getUser,
  updateData,
  updateEmail,
  updatePassword,
  deleteUser,
  accountManagement,
} = require("../controllers/users");

const router = express.Router();

router.post("/auth/signup", createUser);

router.post("/auth/signin", authenticateUser);

router.post("/auth/refresh", secureRoute, refreshUserAccess);

router.delete("/auth/signout", secureRoute, revokeUserAccess);

router.post("/account/:type", accountManagement);

router.get("/:id", secureRoute, getUser);

router.patch("/update/data/:id", secureRoute, updateData);

router.patch("/update/email/:id", secureRoute, updateEmail);

router.patch("/update/password/:id", secureRoute, updatePassword);

router.delete("/delete/:id", secureRoute, deleteUser);

module.exports = router;
