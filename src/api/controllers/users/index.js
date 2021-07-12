const createError = require("http-errors");
const UserService = require("@services/users");
const { getTokenFromHeader } = require("@helpers/auth");

const userService = new UserService();

async function GetUser(req, res) {
  try {
    const { id } = req.params;
    if (id) {
      const headerToken = getTokenFromHeader(req);
      const result = await userService.Get({ id, headerToken });
      res.status(201).json(result);
    } else {
      res.status(400).send(createError(400));
    }
  } catch (error) {
    res.status(error).send(createError(error));
  }
}

async function UpdateUser(req, res) {
  try {
    const { id } = req.params;
    if (id) {
      const data = req.body;
      const headerToken = getTokenFromHeader(req);
      const result = await userService.Update({
        id,
        data,
        headerToken,
      });
      res.status(200).json(result);
    } else {
      res.status(400).send(createError(400));
    }
  } catch (error) {
    res.status(error).send(createError(error));
  }
}

async function DeleteUser(req, res) {
  try {
    const { id } = req.params;
    if (id) {
      const headerToken = getTokenFromHeader(req);
      const result = await userService.Delete({ id, headerToken });
      res.sendStatus(result);
    } else {
      res.status(400).send(createError(400));
    }
  } catch (error) {
    res.status(error).send(createError(error));
  }
}

async function ManageUser(req, res) {
  try {
    const { type } = req.params;

    const { token, userId, email, password } = req.body;
    if (type && (token || userId || email || password)) {
      const result = await userService.Manage({
        type,
        data: { token, userId, email, password },
      });
      res.sendStatus(result);
    } else {
      res.status(400).send(createError(400));
    }
  } catch (error) {
    res.status(error).send(createError(error));
  }
}

module.exports = { GetUser, UpdateUser, DeleteUser, ManageUser };
