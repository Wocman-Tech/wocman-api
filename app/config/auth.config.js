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
        email: "",//create your account with the transport for mailing, put your email here
        message_server: "gmail",
        password: "",//put your transport password here
        name: "Wocman Technology",
        website: "https://wocman.netlify.app",
        otpId: "8C5YFUT5NWJo8TD7tVQ20o4QF",
        googleAppClientID: "832018209601-v1h3d5qgu10p3m4pv6l1jvgq9gcrl9v1.apps.googleusercontent.com",
        googleAppClientSecret: "o1pyycovPehN0loXowHRh0aR",
        awsS3AccessKeyId: "AKIAUPJAS3S6WTQ37DUN",
        awsS3SecretAccessKey: "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",
        awsS3BucketName: "wocmantechnologyuploads",
        companyPassword: 'rathH-5Rhsa-sa755bB0o!d'
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
        googleAppClientID: "195099622008-8thdppg008minmb2vlmq4q3nd6obbfjv.apps.googleusercontent.com",
        googleAppClientSecret: "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",
        awsS3AccessKeyId: "AKIAUPJAS3S6WTQ37DUN",
        awsS3SecretAccessKey: "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",
        awsS3BucketName: "wocmantechnologyuploads",
        companyPassword: 'rathH-5Rhsa-sa755bB0o!d'
    }
}

