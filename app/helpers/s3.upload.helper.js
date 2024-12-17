const { S3Client } = require("@aws-sdk/client-s3");

// Create the S3 client instance
const s3 = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: config.awsS3AccessKeyId,
    secretAccessKey: config.awsS3SecretAccessKey,
  },
  forcePathStyle: true, // Optional, if you use path-style URLs
  tls: true, // Ensures SSL is enabled (same as sslEnabled: true in v2)
});

exports.s3Upload = async (file) => {
  try {
    const params = {
      Bucket: config.awsS3BucketName,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read",
    };

    const data = s3.upload(params).promise();
    return data.then((result) => result).catch((err) => err);
  } catch (error) {
    return error;
  }
};
