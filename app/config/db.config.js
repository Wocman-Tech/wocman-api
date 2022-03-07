// const { workstation }  = require("./env.config");

// //db.config.js
// if (workstation.toLowerCase() == "web") {
//     module.exports = {
//         HOST: "us-cdbr-east-02.cleardb.com",
//         USER: "bdddac9b8448ab",
//         PASSWORD: "f851bc55",
//         DB: "heroku_a9bd7ce27cad867",
//         dialect: "mysql",
//         pool: {
//             max: 5,
//             min: 0,
//             acquire: 30000,
//             idle: 10000
//         }
//     }
// }

// if(workstation.toLowerCase() == "localhost"){
//     module.exports = {
//         HOST: "us-cdbr-east-02.cleardb.com",
//         USER: "bdddac9b8448ab",
//         PASSWORD: "f851bc55",
//         DB: "heroku_a9bd7ce27cad867",
//         dialect: "mysql",
//         pool: {
//             max: 5,
//             min: 0,
//             acquire: 30000,
//             idle: 10000
//         }
//     }
// }

require('dotenv').config();

module.exports = {
  development: {
    host: process.env.DEV_DATABASE_HOST,
    username: process.env.DEV_DATABASE_USER,
    password: process.env.DEV_DATABASE_PASSWORD,
    database: process.env.DEV_DATABASE_NAME,
    dialect: "mysql",
  },
  production: {
    host: process.env.PROD_DATABASE_HOST,
    username: process.env.PROD_DATABASE_USER,
    password: process.env.PROD_DATABASE_PASSWORD,
    database: process.env.PROD_DATABASE_NAME,
    dialect: "mysql",
  },
};