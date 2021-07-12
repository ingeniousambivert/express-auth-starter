const Sequelize = require("sequelize");
const sequelizeORM = require("@config/loaders/sequelize");

const UserModel = sequelizeORM.define(
  "user",
  {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
    },
    firstname: {
      type: Sequelize.STRING,
      allowNull: false,
      notEmpty: true,
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: false,
      notEmpty: true,
    },
    email: {
      type: Sequelize.STRING,
      isEmail: true,
      allowNull: false,
      unique: true,
      notEmpty: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      notEmpty: true,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    permissions: {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      defaultValue: ["user"],
      allowNull: false,
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    verifyToken: { type: Sequelize.STRING },
    verifyExpires: { type: Sequelize.DATE, isDate: true },
    resetToken: { type: Sequelize.STRING },
    resetExpires: { type: Sequelize.DATE, isDate: true },
  },
  {
    timestamps: true,
  }
);

UserModel.sync().then(() => {
  console.log("Users table created");
});

module.exports = UserModel;
