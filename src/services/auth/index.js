const crypto = require("crypto");
const bcrypt = require("bcrypt");
const logger = require("@helpers/logger");
const UserModel = require("@models/users");
const {
  generateAccessToken,
  generateRefreshToken,
  isValidPassword,
  verifyRefreshToken,
} = require("@helpers/auth");
const MailerService = require("@services/mailer");
const redisClient = require("@config/loaders/redis");
const { getIncrementDate } = require("@utils");

const mailerService = new MailerService();

class AuthService {
  async Signup(params) {
    const { firstname, lastname, email, password } = params;
    return new Promise(async (resolve, reject) => {
      try {
        const foundUser = await UserModel.findOne({ where: { email } });
        if (foundUser) {
          reject(409);
        } else {
          const verifyToken = crypto.randomBytes(32).toString("hex");
          const verifyTokenHash = await bcrypt.hash(verifyToken, 10);
          const verifyExpires = getIncrementDate(24);
          const passwordHash = await bcrypt.hash(password, 10);

          const newUser = await UserModel.create({
            firstname,
            lastname,
            email,
            password: passwordHash,
            verifyToken: verifyTokenHash,
            verifyExpires,
          });
          const userId = newUser.get("id");
          const accessToken = await generateAccessToken(userId);
          const refreshToken = await generateRefreshToken(userId);
          const mailerParams = { email, id: userId, token: verifyToken };
          await mailerService.Send(mailerParams, "verifyEmail");
          resolve({ accessToken, refreshToken, id: userId });
        }
      } catch (error) {
        logger.error("AuthService.Signup", error);
        reject(500);
      }
    });
  }

  async Signin(params) {
    const { email, password } = params;
    return new Promise(async (resolve, reject) => {
      try {
        const user = await UserModel.findOne({ where: { email } });
        if (user) {
          if (await isValidPassword(password, user.password)) {
            const { id } = user;
            const accessToken = await generateAccessToken(id);
            const refreshToken = await generateRefreshToken(id);
            resolve({ accessToken, refreshToken, id });
          } else {
            reject(401);
          }
        } else {
          reject(401);
        }
      } catch (error) {
        logger.error("AuthService.Signin", error);
        reject(500);
      }
    });
  }

  async Refresh(params) {
    const { refreshToken } = params;
    return new Promise(async (resolve, reject) => {
      try {
        const { isTokenValid, id } = await verifyRefreshToken(refreshToken);
        if (!isTokenValid) {
          reject(403);
        } else {
          const accessToken = await generateAccessToken(id);
          const newRefreshToken = await generateRefreshToken(id);
          resolve({ accessToken, refreshToken: newRefreshToken, id });
        }
      } catch (error) {
        logger.error("AuthService.Refresh", error);
        reject(500);
      }
    });
  }

  async Revoke(params) {
    const { refreshToken } = params;
    return new Promise(async (resolve, reject) => {
      try {
        const { isTokenValid, id } = await verifyRefreshToken(refreshToken);
        if (!isTokenValid) {
          reject(403);
        } else {
          redisClient.DEL(id);
          resolve(204);
        }
      } catch (error) {
        logger.error("AuthService.Revoke", error);
        reject(500);
      }
    });
  }
}

module.exports = AuthService;
