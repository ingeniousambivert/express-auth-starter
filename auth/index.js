const passport = require("passport");
const passportJWT = require("passport-jwt");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const UserModel = require("../models/users");

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    function (jwtPayload, done) {
      return UserModel.findById(jwtPayload.sub)
        .then((user) => {
          return done(null, user);
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);

const generateToken = (user) => {
  return jwt.sign(
    {
      iss: "express-auth",
      sub: user.id,
      issat: new Date().getTime(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

const isValidPassword = async function (password, user) {
  return await bcrypt.compare(password, user.password);
};

const decodeToken = function (token) {
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  return decodedToken;
};

const secureRoute = passport.authenticate("jwt", { session: false });

module.exports = {
  generateToken,
  isValidPassword,
  secureRoute,
  decodeToken,
};
