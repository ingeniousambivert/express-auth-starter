const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const logger = require("@helpers/logger");
const { accessSecret, refreshSecret, jwtExpiry } = require("@config");
const redisClient = require("@config/loaders/redis");

const payload = {
  iss: "express-starter",
  issat: new Date().getTime(),
};

const generateAccessToken = (userId) => {
  return new Promise((resolve, reject) => {
    payload.sub = userId;
    const options = {
      expiresIn: jwtExpiry,
    };
    JWT.sign(payload, accessSecret, options, (error, token) => {
      if (error) {
        logger.error("helper:auth:generateAccessToken:", error);
        reject(error);
      }
      resolve(token);
    });
  });
};

const generateRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    payload.sub = userId;
    const options = {
      expiresIn: "1y",
    };
    JWT.sign(payload, refreshSecret, options, (error, token) => {
      if (error) {
        logger.error("helper:auth:generateRefreshToken", error);
        reject(error);
      }
      redisClient.SET(
        userId.toString(),
        token,
        "EX",
        365 * 24 * 60 * 60,
        (error, reply) => {
          if (error) {
            logger.error("helper:auth:generateRefreshToken", error);
            reject(error);
          }
          resolve(token);
        }
      );
    });
  });
};

const isValidPassword = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

const verifyAccessToken = (id, token) => {
  return new Promise((resolve, reject) => {
    JWT.verify(token, accessSecret, (error, payload) => {
      if (error) {
        logger.error("verifyAccessToken", error);
        reject(error);
      } else {
        const userId = payload.sub;
        if (id === userId) resolve(true);
        else resolve(false);
      }
    });
  });
};

const decodeUserID = (token) => {
  const decoded = JWT.verify(token, accessSecret);
  return decoded.sub;
};

const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    JWT.verify(token, refreshSecret, (error, payload) => {
      if (error) {
        logger.error("verifyRefreshToken", error);
        reject(error);
      } else {
        const userId = payload.sub;
        redisClient.GET(userId, (error, result) => {
          if (error) {
            logger.error("verifyRefreshToken", error);
            reject(error);
          }
          if (token === result) {
            resolve({ isTokenValid: true, id: userId });
          } else {
            resolve({ isTokenValid: false, id: null });
          }
        });
      }
    });
  });
};

const getTokenFromHeader = (req) => {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  isValidPassword,
  verifyAccessToken,
  decodeUserID,
  verifyRefreshToken,
  getTokenFromHeader,
};
