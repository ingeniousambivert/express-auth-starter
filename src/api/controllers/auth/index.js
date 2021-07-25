const createError = require("http-errors");
const logger = require("@helpers/logger");
const UserModel = require("@models/users");
const AuthService = require("@services/auth");
const MailerService = require("@services/mailer");

const authService = new AuthService(UserModel);
const mailerService = new MailerService();

authService.on("auth:signup", async (params) => {
  try {
    const { email, id, token, type } = params;
    await mailerService.Send({ email, id, token }, type);
  } catch (error) {
    logger.error(`events:auth:signup: ${error}`);
  }
});

authService.on("auth:signin", async (params) => {
  try {
    const id = params;
    await UserModel.findByIdAndUpdate(
      id,
      { lastLogin: new Date() },
      { new: true }
    );
  } catch (error) {
    logger.error(`events:auth:signin: ${error}`);
  }
});

authService.on("auth:error", async (error) => {
  logger.error(`events:auth:error: ${error}`);
});

async function SignupUser(req, res) {
  try {
    const { firstname, lastname, email, password } = req.body;
    if (firstname && lastname && email && password) {
      const result = await authService.Signup({
        firstname,
        lastname,
        email,
        password,
      });

      res.status(201).json(result);
    } else {
      res.status(400).send(createError(400));
    }
  } catch (error) {
    res.status(error).send(createError(error));
  }
}

async function SigninUser(req, res) {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const result = await authService.Signin({ email, password });
      res.status(200).json(result);
    } else {
      res.status(400).send(createError(400));
    }
  } catch (error) {
    res.status(error).send(createError(error));
  }
}

async function RefreshAccess(req, res) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const result = await authService.Refresh({ refreshToken });
      res.status(200).json(result);
    } else {
      res.status(400).send(createError(400));
    }
  } catch (error) {
    res.status(error).send(createError(error));
  }
}

async function RevokeAccess(req, res) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const result = await authService.Revoke({ refreshToken });
      res.sendStatus(result);
    } else {
      res.status(400).send(createError(400));
    }
  } catch (error) {
    res.status(error).send(createError(error));
  }
}

module.exports = { SignupUser, SigninUser, RefreshAccess, RevokeAccess };
