const crypto = require("crypto");
const bcrypt = require("bcrypt");
const UserModel = require("../models/users");
const {
  generateAccessToken,
  generateRefreshToken,
  isValidPassword,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../auth");
const { clientUrl } = require("../config");
const redisClient = require("../config/redis");
const {
  createVerifyMail,
  createForgotPasswordMail,
  createPasswordResetMail,
  mailTransporter,
  getIncrementDate,
} = require("../utils");

async function createUser(req, res) {
  const { firstname, lastname, email, password } = req.body;

  try {
    UserModel.findOne({ where: { email } }).then(async (foundUser) => {
      if (foundUser) {
        return res.status(409).json({ error: "Email is already in use" });
      } else {
        const verifyToken = crypto.randomBytes(32).toString("hex");
        const verifyTokenHash = await bcrypt.hash(verifyToken, 10);
        const verifyExpires = getIncrementDate(24);
        const passwordHash = await bcrypt.hash(password, 10);

        UserModel.create({
          firstname,
          lastname,
          email,
          password: passwordHash,
          verifyToken: verifyTokenHash,
          verifyExpires,
        })
          .then(async (user) => {
            const userId = user.get("id");
            const userEmail = user.get("email");
            const mailOptions = createVerifyMail(
              userEmail,
              userId,
              verifyToken,
              clientUrl
            );
            mailTransporter.sendMail(mailOptions, async function (err) {
              if (err) {
                await UserModel.destroy({ where: { id : userId } })
                return res.status(500).json({ error: err.message });
              }
              res.status(201).json({
                message: `Created User with ID: ${userId} and sent verification email to ${userEmail}`,
              });
            });
          })
          .catch((error) => {
            return res.status(500).json({ error });
          });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function authenticateUser(req, res) {
  const { email, password } = req.body;
  try {
    UserModel.findOne({ where: { email } })
      .then(async (user) => {
        if (user) {
          if (await isValidPassword(password, user.password)) {
            const { id } = user;
            const accessToken = await generateAccessToken(id);
            const refreshToken = await generateRefreshToken(id);
            return res.status(200).json({ accessToken, refreshToken, id: id });
          } else {
            return res.status(401).json({ error: "Password is invalid" });
          }
        } else {
          return res.status(401).json({ error: "Email is invalid" });
        }
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({ error: error.message });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function refreshUserAccess(req, res) {
  const { refreshToken } = req.body;
  try {
    const { isTokenValid, id } = await verifyRefreshToken(refreshToken);
    if (!isTokenValid) {
      return res.status(403).json({ error: "Access denied" });
    } else {
      const accessToken = await generateAccessToken(id);
      const newRefreshToken = await generateRefreshToken(id);
      return res
        .status(200)
        .json({ accessToken, refreshToken: newRefreshToken, id });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function revokeUserAccess(req, res) {
  const { refreshToken } = req.body;
  try {
    const { isTokenValid, id } = await verifyRefreshToken(refreshToken);
    if (!isTokenValid) {
      return res.status(403).json({ error: "Access denied" });
    } else {
      redisClient.DEL(id, (err, val) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        return res.sendStatus(204);
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getUser(req, res) {
  const { id } = req.params;
  try {
    const isTokenValid = verifyAccessToken(
      id,
      req.headers.authorization.split(" ")[1]
    );
    if (!isTokenValid) {
      return res.status(403).json({ error: "Access denied" });
    } else {
      UserModel.findByPk(id, { attributes: { exclude: ["password"] } }).then(
        (user) => {
          if (user) {
            return res.status(200).json(user);
          } else {
            return res.status(404).json({ error: "User not found" });
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateData(req, res) {
  const { id } = req.params;
  const data = req.body;
  try {
    const isTokenValid = verifyAccessToken(
      id,
      req.headers.authorization.split(" ")[1]
    );
    if (!isTokenValid) {
      return res.status(403).json({ error: "Access denied" });
    } else {
      UserModel.findByPk(id).then(async (user) => {
        if (user) {
          if (data.email || data.password) {
            return res.status(400).json({
              error: "Cannot update email or password via this endpoint",
            });
          } else {
            UserModel.update(data, { returning: true, where: { id } })
              .then(([rowsUpdate, updatedUser]) => {
                return res.status(200).json(updatedUser);
              })
              .catch((error) => {
                console.log(error);
                return res.status(400).json({ error: "Could not update user" });
              });
          }
        } else {
          return res.status(404).json({ error: "User not found" });
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateEmail(req, res) {
  const { id } = req.params;
  const { email, password } = req.body;
  try {
    if (email && password) {
      const isTokenValid = verifyAccessToken(
        id,
        req.headers.authorization.split(" ")[1]
      );
      if (!isTokenValid) {
        return res.status(403).json({ error: "Access denied" });
      } else {
        UserModel.findByPk(id).then(async (user) => {
          if (user) {
            if (await isValidPassword(password, user.password)) {
              const verifyToken = crypto.randomBytes(32).toString("hex");
              const verifyTokenHash = await bcrypt.hash(verifyToken, 10);
              const verifyExpires = getIncrementDate(24);
              UserModel.update(
                {
                  email,
                  isVerified: false,
                  verifyToken: verifyTokenHash,
                  verifyExpires,
                },
                { returning: true, where: { id } }
              )
                .then(([rowsUpdate, updatedUser]) => {
                  if (rowsUpdate > 0) {
                    const mailOptions = createVerifyMail(
                      email,
                      id,
                      verifyToken,
                      clientUrl
                    );
                    mailTransporter.sendMail(mailOptions, function (err) {
                      if (err) {
                        return res.status(500).json({ error: err.message });
                      }
                      return res.status(200).json({
                        message: `Successfully updated and sent verification email to ${email}`,
                        updatedUser,
                      });
                    });
                  }
                })
                .catch((error) => {
                  console.log(error);
                  return res
                    .status(400)
                    .json({ error: "Could not update user email" });
                });
            } else {
              return res.status(401).json({ error: "Password is invalid" });
            }
          } else {
            return res.status(404).json({ error: "User not found" });
          }
        });
      }
    } else {
      res.status(400).json({ error: "Email and password are required" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updatePassword(req, res) {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  try {
    if (currentPassword && newPassword) {
      const isTokenValid = verifyAccessToken(
        id,
        req.headers.authorization.split(" ")[1]
      );
      if (!isTokenValid) {
        return res.status(403).json({ error: "Access denied" });
      } else {
        UserModel.findByPk(id).then(async (user) => {
          if (user) {
            if (await isValidPassword(currentPassword, user.password)) {
              const passwordHash = await bcrypt.hash(newPassword, 10);
              UserModel.update(
                { password: passwordHash },
                { returning: true, where: { id } }
              ).then(([rowsUpdate, updatedUser]) => {
                if (rowsUpdate > 0) {
                  const email = updatedUser[0]["dataValues"]["email"];
                  const mailOptions = createPasswordResetMail(email, "update");
                  mailTransporter.sendMail(mailOptions, function (err) {
                    if (err) {
                      return res.status(500).json({ error: err.message });
                    }
                  });
                  return res
                    .status(200)
                    .json({ message: "Successfully updated password" });
                } else {
                  return res
                    .status(400)
                    .json({ message: "Could not update password" });
                }
              });
            } else {
              return res.status(401).json({ error: "Password is invalid" });
            }
          } else {
            return res.status(404).json({ error: "User not found" });
          }
        });
      }
    } else {
      res
        .status(400)
        .json({ error: "Current password and new password are required" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    if (id) {
      const isTokenValid = verifyAccessToken(
        id,
        req.headers.authorization.split(" ")[1]
      );
      if (!isTokenValid) {
        return res.status(403).json({ error: "Access denied" });
      } else {
        UserModel.destroy({
          where: { id },
        }).then((rowsUpdate) => {
          if (rowsUpdate > 0) {
            return res.status(200).json({
              message: `Successfully deleted user with ID: ${id}`,
            });
          } else {
            return res.status(404).json({ error: "User not found" });
          }
        });
      }
    } else {
      res.status(400).json({ error: "User ID is required" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function accountManagement(req, res) {
  const { type } = req.params;
  const { token, userId, email, password } = req.body;

  try {
    if (token || userId || email || password) {
      switch (type) {
        case "verify-user":
          try {
            UserModel.findByPk(userId).then(async (userData) => {
              if (userData) {
                const user = userData.get({ plain: true });
                if (user.verifyToken && user.verifyExpires) {
                  const isValid = await bcrypt.compare(token, user.verifyToken);
                  if (!isValid) {
                    return res.status(400).json({ error: "Invalid token" });
                  } else {
                    const now = Date.now();
                    const diff = user.verifyExpires - now;
                    if (diff > 0) {
                      UserModel.update(
                        {
                          isVerified: true,
                          verifyToken: null,
                          verifyExpires: null,
                        },
                        { returning: true, where: { id: userId } }
                      ).then(([rowsUpdate, updatedUser]) => {
                        if (rowsUpdate > 0) {
                          return res.status(200).json({
                            updatedUser,
                            message: "User has been succesfully verified",
                          });
                        } else {
                          return res.status(400).json({
                            message: "Could not verify user",
                          });
                        }
                      });
                    } else {
                      return res.status(400).json({ error: "Expired token" });
                    }
                  }
                } else {
                  return res.status(400).json({ error: "Invalid token" });
                }
              } else {
                return res.status(404).json({ error: "User not found" });
              }
            });
          } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
          }
          break;

        case "resend-verify":
          try {
            UserModel.findByPk(userId).then(async (userData) => {
              const user = userData.get({ plain: true });
              if (user) {
                if (user.isVerified === true) {
                  console.log(user.isVerified);
                  return res
                    .status(400)
                    .json({ error: "User is already verified" });
                } else {
                  const verifyToken = crypto.randomBytes(32).toString("hex");
                  const verifyTokenHash = await bcrypt.hash(verifyToken, 10);
                  const verifyExpires = getIncrementDate(24);
                  await UserModel.update(
                    { verifyToken: verifyTokenHash, verifyExpires },
                    { where: { id: userId } }
                  );
                  const mailOptions = createVerifyMail(
                    user.email,
                    userId,
                    verifyToken,
                    clientUrl
                  );
                  mailTransporter.sendMail(mailOptions, function (err) {
                    if (err) {
                      return res.status(500).json({ error: err.message });
                    }
                    res.status(200).json({
                      message: `Resent verification email to ${user.email}`,
                    });
                  });
                }
              } else {
                return res.status(404).json({ error: "User not found" });
              }
            });
          } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
          }
          break;

        case "forgot-password":
          try {
            UserModel.findOne({ where: { email } })
              .then(async (userData) => {
                const user = userData.get({ plain: true });
                if (user) {
                  const id = user.id;
                  const resetToken = crypto.randomBytes(32).toString("hex");
                  const resetTokenHash = await bcrypt.hash(resetToken, 10);
                  const resetExpires = getIncrementDate(6);

                  await UserModel.update(
                    { resetToken: resetTokenHash, resetExpires },
                    { where: { id } }
                  );
                  const mailOptions = createForgotPasswordMail(
                    user.email,
                    id,
                    resetToken,
                    clientUrl
                  );
                  mailTransporter.sendMail(mailOptions, function (err) {
                    if (err) {
                      return res.status(500).json({ error: err.message });
                    }
                    res.status(200).json({
                      message: `Sent a reset password link to ${user.email}`,
                    });
                  });
                } else {
                  return res.status(404).json({ error: "User not found" });
                }
              })
              .catch((error) => {
                console.log(error);
                res.status(500).json({ error: "Could not fetch user data" });
              });
          } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
          }
          break;

        case "reset-password":
          try {
            if (password) {
              UserModel.findByPk(userId).then(async (userData) => {
                const user = userData.get({ plain: true });
                if (user) {
                  if (user.resetToken && user.resetExpires) {
                    const isValid = await bcrypt.compare(
                      token,
                      user.resetToken
                    );
                    if (!isValid) {
                      return res.status(400).json({ error: "Invalid token" });
                    } else {
                      const now = Date.now();
                      const diff = user.resetExpires - now;
                      if (diff > 0) {
                        const passwordHash = await bcrypt.hash(password, 10);
                        await UserModel.update(
                          {
                            password: passwordHash,
                            resetToken: null,
                            resetExpires: null,
                          },
                          { where: { id: userId } }
                        );
                        const mailOptions = createPasswordResetMail(user.email);
                        mailTransporter.sendMail(
                          mailOptions,
                          async function (err) {
                            if (err) {
                              return res
                                .status(500)
                                .json({ error: err.message });
                            }
                            return res.status(200).json({
                              message: "Password Reset Successfully",
                            });
                          }
                        );
                      } else {
                        return res.status(400).json({ error: "Expired token" });
                      }
                    }
                  } else {
                    return res.status(400).json({ error: "Invalid token" });
                  }
                } else {
                  return res.status(404).json({ error: "User not found" });
                }
              });
            } else {
              res.status(400).json({ error: "Password is required" });
            }
          } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Internal Server Error" });
          }
          break;

        default:
          res.status(400).json({ error: "Invalid type" });
          break;
      }
    } else {
      res.status(400).json({ error: "Token and/or User id are required" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
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
};
