const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const config = require("../../app/config/auth.config");

// Create the S3 client instance
const s3 = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: config.awsS3AccessKeyId,
    secretAccessKey: config.awsS3SecretAccessKey,
  },
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

    const command = new PutObjectCommand(params);
    const result = await s3.send(command);

    return result; // The result contains metadata about the upload.
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};
