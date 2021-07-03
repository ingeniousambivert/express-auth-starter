const Sequelize = require("sequelize");
const {
  postgresDatabase,
  postgresUser,
  postgresPassword,
  sequelizeDialect,
  host,
} = require("./index");
const logger = require("../utils/logger");

console.log(postgresDatabase, postgresUser, sequelizeDialect, host);

const sequelize = new Sequelize(
  postgresDatabase,
  postgresUser,
  postgresPassword,
  {
    host: host,
    dialect: sequelizeDialect,
  }
);

sequelize
  .authenticate()
  .then(() => console.log("PostgreSQL client connected"))
  .catch((error) => logger.error(`${error.message}`));

module.exports = sequelize;
