require("dotenv").config();

module.exports = {
  development: {
    host: process.env.DEV_DATABASE_HOST,
    username: process.env.DEV_DATABASE_USER,
    password: process.env.DEV_DATABASE_PASSWORD,
    database: process.env.DEV_DATABASE_NAME,
    dialect: process.env.DEV_DATABASE_DIALECT,
  },
  production: {
    host: process.env.PROD_DATABASE_HOST,
    username: process.env.PROD_DATABASE_USER,
    password: process.env.PROD_DATABASE_PASSWORD,
    database: process.env.PROD_DATABASE_NAME,
    dialect: process.env.PROD_DATABASE_DIALECT,
  },
};
