const { workstation }  = require("./env.config");

if (workstation.toLowerCase() == "web") {
    module.exports = {
        HOST: "us-cdbr-east-02.cleardb.com",
        USER: "bdddac9b8448ab",
        PASSWORD: "f851bc55",
        DB: "heroku_a9bd7ce27cad867",
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
        PASSWORD: "",
        DB: "express_api_1",
        dialect: "mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
}
