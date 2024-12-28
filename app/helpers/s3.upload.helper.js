const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
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
      Key: `${Date.now()}-${file.originalname}`, // Add a unique timestamp to avoid overwriting files
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const upload = new Upload({
      client: s3,
      params: params,
    });

    const response = await upload.done();

    const fileUrl = response.Location;

    return { Location: fileUrl }; // Return the file URL with a "Location" property, similar to what your existing code expects
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error; // Rethrow the error to be handled by the calling function
  }
};
