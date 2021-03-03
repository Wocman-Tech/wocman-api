const { workstation }  = require("./env.config");


//auth.config.js

if (workstation.toLowerCase() === "web") {
    module.exports = {
        secret: "wocman-technology-api-justice-auth-0-security",
        resolve: "https://wocman-node-api-8080.herokuapp.com",
        port: '/',
        version: "/api/v1/",
        coreRootFolder: "",
        coreImageFloder: "app/uploads/",
        split: "/XX98XX",
        email: "ugboguj@yahoo.com",
        message_server: "Yahoo",
        password: "rrilmtbqmsduewpy",
        name: "Wocman Technology",
        website: "https://wocman.netlify.app"

    }
}

if(workstation.toLowerCase() === "localhost"){
    module.exports = {
        secret: "wocman-technology-api-justice-auth-0-security",
        resolve: "http://localhost",
        port: ':8080/',
        version: "/api/v1/",
        coreRootFolder: "",
        coreImageFloder: "app/uploads/",
        split: "/XX98XX",
        email: "ugboguj@yahoo.com",
        message_server: "Yahoo",
        password: "rrilmtbqmsduewpy",
        name: "Wocman Technology",
        website: "https://wocman.netlify.app"

    }
}
