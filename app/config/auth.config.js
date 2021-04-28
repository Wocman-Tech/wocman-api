const { workstation }  = require("./env.config");


//auth.config.js

if (workstation.toLowerCase() === "web") {
    module.exports = {
        secret: "",
        resolve: "",
        port: '/',
        version: "/api/v1/",
        coreRootFolder: "",
        coreImageFloder: "app/uploads/",
        split: "/XX98XX",
        email: "",
        message_server: "Yahoo",
        password: "",
        name: "Wocman Technology",
        website: "",
        otpId: "",
        googleAppClientID: "",
        googleAppClientSecret: "",
        awsS3AccessKeyId: "",
        awsS3SecretAccessKey: "",
        awsS3BucketName: ""
    }
}

if(workstation.toLowerCase() === "localhost"){
    module.exports = {
        secret: "",
        resolve: "",
        port: '',
        version: "/api/v1/",
        coreRootFolder: "",
        coreImageFloder: "app/uploads/",
        split: "/XX98XX",
        email: "",
        message_server: "Yahoo",
        password: "",
        name: "Wocman Technology",
        website: "",
        otpId: "",
        googleAppClientID: "",
        googleAppClientSecret: "",
        awsS3AccessKeyId: "",
        awsS3SecretAccessKey: "",
        awsS3BucketName: ""
    }
}

