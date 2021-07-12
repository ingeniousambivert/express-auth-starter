const createError = require("http-errors");
const AuthService = require("@services/auth");

const authService = new AuthService();

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
