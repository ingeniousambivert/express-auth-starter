const crypto = require("crypto");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");
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
    const foundUser = await UserModel.findOne({ email });
    if (foundUser) {
      return res.status(409).json({ error: "Email is already in use" });
    }
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenHash = await bcrypt.hash(verifyToken, 10);
    const verifyExpires = getIncrementDate(24);

    const newUser = new UserModel({
      firstname,
      lastname,
      email,
      password,
      verifyToken: verifyTokenHash,
      verifyExpires,
    });
    await newUser.save(async (error) => {
      if (error) {
        logger.error(
          `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
        );
        return res.status(500).json({ error: error.message });
      }
      const mailOptions = createVerifyMail(
        newUser.email,
        newUser._id,
        verifyToken,
        clientUrl
      );
      mailTransporter.sendMail(mailOptions, async function (error) {
        if (error) {
          await UserModel.findByIdAndDelete(newUser._id);
          logger.error(
            `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
          );
          return res.status(500).json({ error: error.message });
        }
        res.status(201).json({
          message: `Created User with ID: ${newUser._id} and sent verification email to ${newUser.email}`,
        });
      });
    });
  } catch (error) {
    logger.error(
      `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    return res.status(500).json({ error: error.message });
  }
}

async function authenticateUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      if (await isValidPassword(password, user.password)) {
        const { _id } = user;
        const accessToken = await generateAccessToken(_id);
        const refreshToken = await generateRefreshToken(_id);

        return res.status(200).json({ accessToken, refreshToken, id: _id });
      } else {
        return res.status(401).json({ error: "Password is invalid" });
      }
    } else {
      return res.status(401).json({ error: "Email is invalid" });
    }
  } catch (error) {
    logger.error(
      `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    return res.status(500).json({ error: error.message });
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
    logger.error(
      `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    return res.status(500).json({ error: error.message });
  }
}

async function revokeUserAccess(req, res) {
  const { refreshToken } = req.body;
  try {
    const { isTokenValid, id } = await verifyRefreshToken(refreshToken);
    if (!isTokenValid) {
      return res.status(403).json({ error: "Access denied" });
    } else {
      redisClient.DEL(id, (error, val) => {
        if (error) {
          logger.error(
            `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
          );
          return res.status(500).json({ error: error.message });
        }
        return res.sendStatus(204);
      });
    }
  } catch (error) {
    logger.error(
      `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    return res.status(500).json({ error: error.message });
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
      const user = await UserModel.findById(id, { password: 0 });
      if (user) {
        return res.status(200).json(user);
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    }
  } catch (error) {
    logger.error(
      `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    return res.status(500).json({ error: error.message });
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
      const user = await UserModel.findById(id);
      if (user) {
        if (data.email || data.password) {
          return res.status(400).json({
            error: "Cannot update email or password via this endpoint",
          });
        } else {
          const updatedUser = await UserModel.findOneAndUpdate(
            { _id: id },
            {
              $set: data,
            },
            {
              new: true,
            }
          );

          return res.status(200).json(updatedUser);
        }
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    }
  } catch (error) {
    logger.error(
      `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    return res.status(500).json({ error: error.message });
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
        const user = await UserModel.findById(id);
        if (user) {
          if (await isValidPassword(password, user.password)) {
            const verifyToken = crypto.randomBytes(32).toString("hex");
            const verifyTokenHash = await bcrypt.hash(verifyToken, 10);
            const verifyExpires = getIncrementDate(24);
            const updatedUser = await UserModel.findByIdAndUpdate(
              id,
              {
                email,
                isVerified: false,
                verifyToken: verifyTokenHash,
                verifyExpires,
              },
              {
                new: true,
              }
            );
            const mailOptions = createVerifyMail(
              updatedUser.email,
              id,
              verifyToken,
              clientUrl
            );
            mailTransporter.sendMail(mailOptions, function (error) {
              if (error) {
                logger.error(
                  `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
                );
                return res.status(500).json({ error: error.message });
              }
              return res.status(200).json({
                message: `Sent verification email to ${updatedUser.email}`,
                updatedUser,
              });
            });
          } else {
            return res.status(401).json({ error: "Password is invalid" });
          }
        } else {
          return res.status(404).json({ error: "User not found" });
        }
      }
    } else {
      res.status(400).json({ error: "Email and password are required" });
    }
  } catch (error) {
    logger.error(
      `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    return res.status(500).json({ error: error.message });
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
        const user = await UserModel.findById(id);
        if (user) {
          if (await isValidPassword(currentPassword, user.password)) {
            const passwordHash = await bcrypt.hash(newPassword, 10);
            await UserModel.findByIdAndUpdate(id, { password: passwordHash });
            const mailOptions = createPasswordResetMail(user.email, "update");
            mailTransporter.sendMail(mailOptions, function (error) {
              if (error) {
                logger.error(
                  `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
                );
                return res.status(500).json({ error: error.message });
              }
            });
            return res
              .status(200)
              .json({ message: "Successfully updated password" });
          } else {
            return res.status(401).json({ error: "Password is invalid" });
          }
        } else {
          return res.status(404).json({ error: "User not found" });
        }
      }
    } else {
      res
        .status(400)
        .json({ error: "Current password and new password are required" });
    }
  } catch (error) {
    logger.error(
      `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    return res.status(500).json({ error: error.message });
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
        const user = await UserModel.findById(id);
        if (user) {
          await UserModel.findByIdAndDelete(id);
          return res.status(200).json({
            message: "Successfully deleted user",
          });
        } else {
          return res.status(404).json({ error: "User not found" });
        }
      }
    } else {
      res.status(400).json({ error: "User id is required" });
    }
  } catch (error) {
    logger.error(
      `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    return res.status(500).json({ error: error.message });
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
            const user = await UserModel.findById(userId);
            if (user) {
              if (user.verifyToken && user.verifyExpires) {
                const isValid = await bcrypt.compare(token, user.verifyToken);
                if (!isValid) {
                  return res.status(400).json({ error: "Invalid token" });
                } else {
                  const now = Date.now();
                  const diff = user.verifyExpires - now;
                  if (diff > 0) {
                    await UserModel.updateOne(
                      { _id: userId },
                      {
                        $set: {
                          isVerified: true,
                          verifyToken: null,
                          verifyExpires: null,
                        },
                      }
                    );
                    return res
                      .status(200)
                      .json({ message: "User has been succesfully verified" });
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
          } catch (error) {
            logger.error(
              `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
            );
            res.status(500).json({ error: "Internal Server Error" });
          }
          break;

        case "resend-verify":
          try {
            const user = await UserModel.findById(userId);
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
                await UserModel.updateOne(
                  { _id: userId },
                  { $set: { verifyToken: verifyTokenHash, verifyExpires } }
                );

                const mailOptions = createVerifyMail(
                  user.email,
                  userId,
                  verifyToken,
                  clientUrl
                );
                mailTransporter.sendMail(mailOptions, function (error) {
                  if (error) {
                    logger.error(
                      `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
                    );
                    return res.status(500).json({ error: error.message });
                  }
                  res.status(200).json({
                    message: `Resent verification email to ${user.email}`,
                  });
                });
              }
            } else {
              return res.status(404).json({ error: "User not found" });
            }
          } catch (error) {
            logger.error(
              `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
            );
            res.status(500).json({ error: "Internal Server Error" });
          }
          break;

        case "forgot-password":
          try {
            const user = await UserModel.findOne({ email });
            if (user) {
              const id = user._id;
              const resetToken = crypto.randomBytes(32).toString("hex");
              const resetTokenHash = await bcrypt.hash(resetToken, 10);
              const resetExpires = getIncrementDate(6);

              await UserModel.findByIdAndUpdate(id, {
                $set: { resetToken: resetTokenHash, resetExpires },
              });

              const mailOptions = createForgotPasswordMail(
                user.email,
                id,
                resetToken,
                clientUrl
              );
              mailTransporter.sendMail(mailOptions, function (error) {
                if (error) {
                  logger.error(
                    `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
                  );
                  return res.status(500).json({ error: error.message });
                }
                res.status(200).json({
                  message: `Sent a reset password link to ${user.email}`,
                });
              });
            } else {
              return res.status(404).json({ error: "User not found" });
            }
          } catch (error) {
            logger.error(
              `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
            );
            res.status(500).json({ error: "Internal Server Error" });
          }
          break;

        case "reset-password":
          try {
            if (password) {
              const user = await UserModel.findById(userId);
              if (user) {
                if (user.resetToken && user.resetExpires) {
                  const isValid = await bcrypt.compare(token, user.resetToken);
                  if (!isValid) {
                    return res.status(400).json({ error: "Invalid token" });
                  } else {
                    const now = Date.now();
                    const diff = user.resetExpires - now;
                    if (diff > 0) {
                      const passwordHash = await bcrypt.hash(password, 10);
                      await UserModel.findByIdAndUpdate(userId, {
                        $set: {
                          password: passwordHash,
                          resetToken: null,
                          resetExpires: null,
                        },
                      });
                      const mailOptions = createPasswordResetMail(user.email);
                      mailTransporter.sendMail(
                        mailOptions,
                        async function (error) {
                          if (error) {
                            logger.error(
                              `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
                            );
                            return res
                              .status(500)
                              .json({ error: error.message });
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
            } else {
              res.status(400).json({ error: "Password is required" });
            }
          } catch (error) {
            logger.error(
              `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
            );
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
    logger.error(
      `${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    return res.status(500).json({ error: error.message });
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
