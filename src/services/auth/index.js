const crypto = require("crypto");
const bcrypt = require("bcrypt");
const EventEmitter = require("events");
const {
  generateAccessToken,
  generateRefreshToken,
  isValidPassword,
  verifyRefreshToken,
} = require("@helpers/auth");
const redisClient = require("@config/loaders/redis");
const { getIncrementDate } = require("@utils");

class AuthService extends EventEmitter {
  constructor(UserModel) {
    super();
    this.UserModel = UserModel;
  }

  async Signup(params) {
    const { firstname, lastname, email, password } = params;
    return new Promise(async (resolve, reject) => {
      try {
        const foundUser = await this.UserModel.findOne({ email });
        if (foundUser) {
          reject(409);
        } else {
          const verifyToken = crypto.randomBytes(32).toString("hex");
          const verifyTokenHash = await bcrypt.hash(verifyToken, 10);
          const verifyExpires = getIncrementDate(24);

          const newUser = new this.UserModel({
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
          const eventParams = {
            email,
            id: _id,
            token: verifyToken,
            type: "verifyEmail",
          };

          this.emit("auth:signup", eventParams);
          resolve({ accessToken, refreshToken, id: _id });
        }
      } catch (error) {
        this.emit("auth:error", new Error(`service:auth:signup: ${error}`));
        reject(500);
      }
    });
  }

  async Signin(params) {
    const { email, password } = params;
    return new Promise(async (resolve, reject) => {
      try {
        const user = await this.UserModel.findOne({ email });
        if (user) {
          if (await isValidPassword(password, user.password)) {
            const { _id } = user;
            const accessToken = await generateAccessToken(_id);
            const refreshToken = await generateRefreshToken(_id);
            this.emit("auth:signin", _id);
            resolve({ accessToken, refreshToken, id: _id });
          } else {
            reject(401);
          }
        } else {
          reject(401);
        }
      } catch (error) {
        this.emit("auth:error", new Error(`service:auth:signin: ${error}`));
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
        this.emit("auth:error", new Error(`service:auth:refresh: ${error}`));
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
        this.emit("auth:error", new Error(`service:auth:revoke: ${error}`));
        reject(500);
      }
    });
  }
}

module.exports = AuthService;
