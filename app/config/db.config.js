const { workstation }  = require("./env.config");

//db.config.js
if (workstation.toLowerCase() == "web") {
    module.exports = {
        HOST: "",
        USER: "",
        PASSWORD: "",
        DB: "",
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
}

if(workstation.toLowerCase() == "localhost"){
    module.exports = {
        HOST: "localhost",
        USER: "root",
        PASSWORD: "Ademiju7",
        DB: "wocman",
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
}