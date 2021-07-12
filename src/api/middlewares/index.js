const passport = require("passport");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const UserModel = require("@models/users");
const { accessSecret } = require("@config");
const logger = require("@helpers/logger");

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
          logger.error("Passport Middleware", error);
          return done(error);
        });
    }
  )
);

const secureRoute = passport.authenticate("jwt", { session: false });

module.exports = { secureRoute };
