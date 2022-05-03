require('dotenv').config();

if (process.env.NODE_ENV === "production") {
    module.exports = {
        secret: process.env.JWT_SECRET,
        resolve: process.env.WOCMAN_API_URL,
        port: '/',
        version: "/api/v1/",
        coreRootFolder: "",
        coreImageFloder: "app/uploads/",
        split: "/XX98XX",
        email: process.env.WOCMAN_EMAIL,//create your account with the transport for mailing, put your email here
        message_server: process.env.WOCMAN_MESSAGE_SERVER,
        password: process.env.WOCMAN_EMAIL_PASSWORD,//put your transport password here
        name: "Wocman Technology",
        website: process.env.WOCMAN_WEB_URL,
        otpId: process.env.WOCMAN_OTP_ID,
        googleAppClientID: process.env.WOCMAN_GOOGLE_CLIENT_ID,
        googleAppClientSecret: process.env.WOCMAN_GOOGLE_CLIENT_SECRET,
        awsS3AccessKeyId: process.env.WOCMAN_AWS_S3_ID,
        awsS3SecretAccessKey: process.env.WOCMAN_AWS_S3_SECRET,
        awsS3BucketName: process.env.WOCMAN_AWS_S3_BUCKET,
        companyPassword: process.env.WOCMAN_BCRYPT_SECRET
    }
}

if (process.env.NODE_ENV === "development") {
    module.exports = {
        secret: process.env.JWT_SECRET,
        resolve: "https://wocman-node-api-8080.herokuapp.com",
        port: '/',
        version: "/api/v1/",
        coreRootFolder: "",
        coreImageFloder: "app/uploads/",
        split: "/XX98XX",
        email: process.env.WOCMAN_EMAIL,//create your account with the transport for mailing, put your email here
        message_server: process.env.WOCMAN_MESSAGE_SERVER,
        password: process.env.WOCMAN_EMAIL_PASSWORD,//put your transport password here
        name: "Wocman Technology",
        website: "https://wocman.netlify.app",
        otpId: process.env.WOCMAN_OTP_ID,
        googleAppClientID: process.env.WOCMAN_GOOGLE_CLIENT_ID,
        googleAppClientSecret: process.env.WOCMAN_GOOGLE_CLIENT_SECRET,
        awsS3AccessKeyId: process.env.WOCMAN_AWS_S3_ID,
        awsS3SecretAccessKey: process.env.WOCMAN_AWS_S3_SECRET,
        awsS3BucketName: process.env.WOCMAN_AWS_S3_BUCKET,
        companyPassword: process.env.WOCMAN_BCRYPT_SECRET
    }
}

if (process.env.NODE_ENV === "localhost"){
    module.exports = {
        secret: process.env.JWT_SECRET,
        resolve: "http://localhost",
        port: ':8080/',
        version: "/api/v1/",
        coreRootFolder: "",
        coreImageFloder: "app/uploads/",
        split: "/XX98XX",
        email: process.env.WOCMAN_EMAIL,//create your account with the transport for mailing, put your email here
        message_server: process.env.WOCMAN_MESSAGE_SERVER,
        password: process.env.WOCMAN_EMAIL_PASSWORD,//put your transport password here
        name: "Wocman Technology",
        website: "https://wocman.netlify.app",
        otpId: process.env.WOCMAN_OTP_ID,
        googleAppClientID: process.env.WOCMAN_GOOGLE_CLIENT_ID,
        googleAppClientSecret: process.env.WOCMAN_GOOGLE_CLIENT_SECRET,
        awsS3AccessKeyId: process.env.WOCMAN_AWS_S3_ID,
        awsS3SecretAccessKey: process.env.WOCMAN_AWS_S3_SECRET,
        awsS3BucketName: process.env.WOCMAN_AWS_S3_BUCKET,
        companyPassword: process.env.WOCMAN_BCRYPT_SECRET
    }
}
