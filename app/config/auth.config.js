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
        website: "https://wocman.netlify.app",
        otpId: "8C5YFUT5NWJo8TD7tVQ20o4QF",
        googleAppClientID: "41617709370-91tu56ot8gqk51ngetncu3b5austpjon.apps.googleusercontent.com",
        googleAppClientSecret: "rjyf2fcqN58cHFJK1aRWt7bb"
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
        website: "https://wocman.netlify.app",
        otpId: "8C5YFUT5NWJo8TD7tVQ20o4QF",
        googleAppClientID: "41617709370-91tu56ot8gqk51ngetncu3b5austpjon.apps.googleusercontent.com",
        googleAppClientSecret: "rjyf2fcqN58cHFJK1aRWt7bb"
    }
}
