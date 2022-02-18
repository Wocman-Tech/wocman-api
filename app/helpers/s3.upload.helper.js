const AWS = require('aws-sdk');
AWS.config.region = 'us-east-2';
const config = require("../config/auth.config");

const s3 = new AWS.S3({
    sslEnabled: true,
    accessKeyId: config.awsS3AccessKeyId,
    secretAccessKey: config.awsS3SecretAccessKey
})

exports.s3Upload = async(file) => {
    try {
        const params = {
            Bucket: config.awsS3BucketName,
            Key: file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
        };

        const data = s3.upload(params).promise();
        return data.then((result) => result).catch((err) => err);
    } catch (error) {
        return error;
    }
};