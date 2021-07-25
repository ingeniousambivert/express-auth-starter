const crypto = require("crypto");
const bcrypt = require("bcrypt");
const EventEmitter = require("events");
const { isValidPassword, verifyAccessToken } = require("@helpers/auth");
const MailerService = require("@services/mailer");
const { getIncrementDate } = require("@utils");

const mailerService = new MailerService();

class UserService extends EventEmitter {
  constructor(UserModel) {
    super();
    this.UserModel = UserModel;
  }

  async Get(params) {
    const { id, headerToken } = params;
    return new Promise(async (resolve, reject) => {
      try {
        const isTokenValid = verifyAccessToken(id, headerToken);
        if (!isTokenValid) {
          reject(403);
        } else {
          const user = await this.UserModel.findById(id, { password: 0 });
          if (user) {
            resolve(user);
          } else {
            reject(404);
          }
        }
      } catch (error) {
        this.emit("user:error", new Error(`service:user:get: ${error}`));
        reject(500);
      }
    });
  }

  async Update(params) {
    const { id, headerToken, data } = params;
    return new Promise(async (resolve, reject) => {
      try {
        const isTokenValid = verifyAccessToken(id, headerToken);
        if (!isTokenValid) {
          reject(403);
        } else {
          const user = await this.UserModel.findById(id);
          if (user) {
            if (data.email && data.password) {
              if (await isValidPassword(data.password, user.password)) {
                const verifyToken = crypto.randomBytes(32).toString("hex");
                const verifyTokenHash = await bcrypt.hash(verifyToken, 10);
                const verifyExpires = getIncrementDate(24);

                const updatedUser = await this.UserModel.findByIdAndUpdate(
                  id,
                  {
                    email: data.email,
                    isVerified: false,
                    verifyToken: verifyTokenHash,
                    verifyExpires,
                  },
                  { new: true }
                ).select({ password: 0 });
                const mailerParams = {
                  email: data.email,
                  id,
                  token: verifyToken,
                };
                await mailerService.Send(mailerParams, "verifyEmail");
                resolve(updatedUser);
              } else {
                reject(401);
              }
            } else if (data.currentPassword && data.newPassword) {
              if (await isValidPassword(data.currentPassword, user.password)) {
                const passwordHash = await bcrypt.hash(data.newPassword, 10);
                await this.UserModel.findByIdAndUpdate(id, {
                  password: passwordHash,
                });
                const mailerParams = { email: user.email };
                await mailerService.Send(mailerParams, "updatePassword");
                resolve(200);
              } else {
                reject(401);
              }
            } else if (
              !data.email &&
              !data.password &&
              !data.currentPassword &&
              !data.newPassword
            ) {
              const updatedUser = await this.UserModel.findByIdAndUpdate(
                id,
                data,
                {
                  new: true,
                }
              ).select({ password: 0 });
              resolve(updatedUser);
            } else {
              reject(400);
            }
          } else {
            reject(404);
          }
        }
      } catch (error) {
        this.emit("user:error", new Error(`service:user:update: ${error}`));
        reject(500);
      }
    });
  }

  async Delete(params) {
    const { id, headerToken } = params;
    return new Promise(async (resolve, reject) => {
      try {
        const isTokenValid = verifyAccessToken(id, headerToken);
        if (!isTokenValid) {
          reject(403);
        } else {
          const user = await this.UserModel.findById(id);
          if (user) {
            await this.UserModel.findByIdAndDelete(id);
            resolve(200);
          } else {
            reject(404);
          }
        }
      } catch (error) {
        this.emit("user:error", new Error(`service:user:delete: ${error}`));
        reject(500);
      }
    });
  }

  async Manage(params) {
    const { type, data } = params;
    const { token, userId, email, password } = data;
    return new Promise(async (resolve, reject) => {
      try {
        switch (type) {
          case "verify-user":
            try {
              const user = await this.UserModel.findById(userId);
              if (user) {
                if (user.verifyToken && user.verifyExpires) {
                  const isValid = await bcrypt.compare(token, user.verifyToken);
                  if (!isValid) {
                    reject(401);
                  } else {
                    const now = Date.now();
                    const diff = user.verifyExpires - now;
                    if (diff > 0) {
                      await this.UserModel.updateOne(
                        { _id: userId },
                        {
                          $set: {
                            isVerified: true,
                            verifyToken: null,
                            verifyExpires: null,
                          },
                        }
                      );
                      resolve(200);
                    } else {
                      reject(401);
                    }
                  }
                } else {
                  reject(401);
                }
              } else {
                reject(404);
              }
            } catch (error) {
              this.emit(
                "user:error",
                new Error(`service:user:verifyuser: ${error}`)
              );
              reject(500);
            }
            break;

          case "resend-verify":
            try {
              const user = await this.UserModel.findById(userId);
              if (user) {
                if (user.isVerified === true) {
                  reject(400);
                } else {
                  const verifyToken = crypto.randomBytes(32).toString("hex");
                  const verifyTokenHash = await bcrypt.hash(verifyToken, 10);
                  const verifyExpires = getIncrementDate(24);
                  await this.UserModel.updateOne(
                    { _id: userId },
                    { $set: { verifyToken: verifyTokenHash, verifyExpires } }
                  );
                  const mailerParams = {
                    email: user.email,
                    id: userId,
                    token: verifyToken,
                  };
                  await mailerService.Send(mailerParams, "verifyEmail");
                  resolve(200);
                }
              } else {
                reject(404);
              }
            } catch (error) {
              this.emit(
                "user:error",
                new Error(`service:user:resendverify: ${error}`)
              );
              reject(500);
            }
            break;

          case "forgot-password":
            try {
              const user = await this.UserModel.findOne({ email });
              if (user) {
                const id = user._id;
                const resetToken = crypto.randomBytes(32).toString("hex");
                const resetTokenHash = await bcrypt.hash(resetToken, 10);
                const resetExpires = getIncrementDate(6);

                await this.UserModel.findByIdAndUpdate(id, {
                  $set: { resetToken: resetTokenHash, resetExpires },
                });

                const mailerParams = { email, id, token: resetToken };
                await mailerService.Send(mailerParams, "forgotPassword");
                resolve(200);
              } else {
                reject(404);
              }
            } catch (error) {
              this.emit(
                "user:error",
                new Error(`service:user:forgotpassword: ${error}`)
              );
              reject(500);
            }
            break;

          case "reset-password":
            try {
              if (password) {
                const user = await this.UserModel.findById(userId);
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
                        await this.UserModel.findByIdAndUpdate(userId, {
                          $set: {
                            password: passwordHash,
                            resetToken: null,
                            resetExpires: null,
                          },
                        });
                        const mailerParams = { email: user.email };
                        await mailerService.Send(
                          mailerParams,
                          "updatePassword"
                        );
                        resolve(200);
                      } else {
                        reject(400);
                      }
                    }
                  } else {
                    reject(400);
                  }
                } else {
                  reject(404);
                }
              } else {
                reject(400);
              }
            } catch (error) {
              this.emit(
                "user:error",
                new Error(`service:user:resetpassword: ${error}`)
              );
              reject(500);
            }
            break;

          default:
            reject(400);
            break;
        }
      } catch (error) {
        this.emit(
          "user:error",
          new Error(`service:user:resetpassword: ${error}`)
        );
        reject(500);
      }
    });
  }
}

module.exports = UserService;
