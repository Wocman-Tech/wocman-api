const { workstation }  = require("./env.config");

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
