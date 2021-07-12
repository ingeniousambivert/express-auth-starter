const crypto = require("crypto");
const bcrypt = require("bcrypt");
const logger = require("@helpers/logger");
const UserModel = require("@models/users");
const { isValidPassword, verifyAccessToken } = require("@helpers/auth");
const { getIncrementDate } = require("@utils");

class UserService {
  async Get(params) {
    const { id, headerToken } = params;
    return new Promise(async (resolve, reject) => {
      try {
        const isTokenValid = verifyAccessToken(id, headerToken);
        if (!isTokenValid) {
          reject(403);
        } else {
          const user = await UserModel.findById(id, { password: 0 });
          if (user) {
            resolve(user);
          } else {
            reject(404);
          }
        }
      } catch (error) {
        logger.error("UserService.Get", error);
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
          const user = await UserModel.findById(id);
          if (user) {
            if (data.email && data.password) {
              if (await isValidPassword(data.password, user.password)) {
                const verifyToken = crypto.randomBytes(32).toString("hex");
                const verifyTokenHash = await bcrypt.hash(verifyToken, 10);
                const verifyExpires = getIncrementDate(24);

                const updatedUser = await UserModel.findByIdAndUpdate(
                  id,
                  {
                    email: data.email,
                    isVerified: false,
                    verifyToken: verifyTokenHash,
                    verifyExpires,
                  },
                  { new: true }
                );
                resolve(updatedUser);
              } else {
                reject(401);
              }
            } else if (data.currentPassword && data.newPassword) {
              if (await isValidPassword(data.currentPassword, user.password)) {
                const passwordHash = await bcrypt.hash(data.newPassword, 10);
                await UserModel.findByIdAndUpdate(id, {
                  password: passwordHash,
                });
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
              const updatedUser = await UserModel.findByIdAndUpdate(id, data, {
                new: true,
              });
              resolve(updatedUser);
            } else {
              reject(400);
            }
          } else {
            reject(404);
          }
        }
      } catch (error) {
        logger.error("UserService.Update", error);
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
          const user = await UserModel.findById(id);
          if (user) {
            await UserModel.findByIdAndDelete(id);
            resolve(200);
          } else {
            reject(404);
          }
        }
      } catch (error) {
        logger.error("UserService.Delete", error);
        reject(500);
      }
    });
  }
}

module.exports = UserService;
