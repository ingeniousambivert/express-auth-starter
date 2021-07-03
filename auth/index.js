const passport = require("passport");
const passportJWT = require("passport-jwt");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const UserModel = require("../models/users");
const logger = require("../utils/logger");
const { accessSecret, refreshSecret } = require("../config");
const client = require("../config/redis");

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: accessSecret,
    },
    function (jwtPayload, done) {
      return UserModel.findById(jwtPayload.sub)
        .then((user) => {
          return done(null, user);
        })
        .catch((error) => {
          logger.error(`${error.message}`);
          return done(error);
        });
    }
  )
);

const generateAccessToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      iss: "teller-blog",
      sub: userId,
      issat: new Date().getTime(),
    };
    const options = {
      expiresIn: "1d",
    };
    JWT.sign(payload, accessSecret, options, (error, token) => {
      if (error) {
        logger.error(`${error.message}`);
        reject(error);
      }
      resolve(token);
    });
  });
};

const generateRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      iss: "express-starter",
      sub: userId,
      issat: new Date().getTime(),
    };
    const options = {
      expiresIn: "1y",
    };
    JWT.sign(payload, refreshSecret, options, (error, token) => {
      if (error) {
        logger.error(`${error.message}`);
        reject(error);
      }
      client.SET(
        userId.toString(),
        token,
        "EX",
        365 * 24 * 60 * 60,
        (error, reply) => {
          if (error) {
            logger.error(`${error.message}`);
            reject(error);
            return;
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
  const decoded = JWT.verify(token, accessSecret);
  if (id === decoded?.sub) return true;
  else return false;
};

const decodeUserID = (token) => {
  const decoded = JWT.verify(token, accessSecret);
  return decoded.sub;
};

const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    JWT.verify(token, refreshSecret, (err, payload) => {
      if (err) return resolve({ isTokenValid: false, id: null });
      const userId = payload.sub;
      client.GET(userId, (err, result) => {
        if (error) {
          logger.error(`${error.message}`);
          resolve({ isTokenValid: false, id: null });
          return;
        }
        if (token === result)
          return resolve({ isTokenValid: true, id: userId });
        resolve({ isTokenValid: false, id: null });
      });
    });
  });
};

const secureRoute = passport.authenticate("jwt", { session: false });

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  isValidPassword,
  secureRoute,
  verifyAccessToken,
  decodeUserID,
  verifyRefreshToken,
};
