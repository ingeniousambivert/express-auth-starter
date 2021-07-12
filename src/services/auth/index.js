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
        const foundUser = await UserModel.findOne({ email });
        if (foundUser) {
          reject(409);
        } else {
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
          await newUser.save();
          const { _id } = newUser;
          const accessToken = await generateAccessToken(_id);
          const refreshToken = await generateRefreshToken(_id);
          const mailerParams = { email, id: _id, token: verifyToken };
          await mailerService.Send(mailerParams, "verifyEmail");
          resolve({ accessToken, refreshToken, id: _id });
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
        const user = await UserModel.findOne({ email });
        if (user) {
          if (await isValidPassword(password, user.password)) {
            const { _id } = user;
            const accessToken = await generateAccessToken(_id);
            const refreshToken = await generateRefreshToken(_id);
            resolve({ accessToken, refreshToken, id: _id });
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
