const pathRoot = '../../../../../';
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");

const { createProject } = require('../../../../../service/customer/project.service');
const validator = require('../../../../../validation/project.validation')
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

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

const Skills = db.Skills;
const Projects = db.Projects;
const Project = db.Projecttype;

exports.uploadProject = async (req, res, next) => {
    try {
      let imageUrls = []; // Collect uploaded file URLs
  
      // Check if files exist in the request
      if (Array.isArray(req.files) && req.files.length > 0) {
        // Loop through the uploaded files
        for (const file of req.files) {
          let myFile = file.originalname.split(".");
          const fileType = myFile[myFile.length - 1];
          const uniqueFileName = `${Date.now()}.${fileType}`;
  
          const params = {
            Bucket: config.awsS3BucketName, // Your S3 bucket name
            Key: uniqueFileName, // Unique file key
            Body: file.buffer, // File content
            ContentType: file.mimetype, // Ensure correct content type
          };
  
          try {
            const uploadCommand = new PutObjectCommand(params);
            await s3.send(uploadCommand);
  
            // Build the file URL
            const fileUrl = `https://${config.awsS3BucketName}.s3.amazonaws.com/${uniqueFileName}`;
            imageUrls.push(fileUrl);  // Add file URL to the imageUrls array
          } catch (error) {
            console.error("Error uploading file:", error);
            return res.status(500).send({
              statusCode: 500,
              status: false,
              message: "Error uploading file",
              data: [],
            });
          }
        }
      }
  
      // Prepare the project data, including images
      const projectData = { ...req.body, images: imageUrls };
      console.log("Data passed to createProject:", projectData);
  
      // Extract relevant data for project creation
      const { description, topic, address, city, projecttypeid, startDate } = req.body;
  
      // Create the project in the database
      const project = await Projects.create({
        project: topic,
        description: description,
        address: address,
        city: city,
        projectid: projecttypeid,  // Assuming this is the Projecttype ID
        customerid: req.userId,    // Assuming the user ID is in req.userId
        images: imageUrls.join(', '),  // Convert array of image URLs into a comma-separated string
        startDate,
      });
  
      // Respond with success message and created project data
      return res.status(201).json({
        statusCode: 201,
        status: true,
        message: "Project created successfully",
        data: project,
      });
  
    } catch (error) {
      console.error("Error in uploadProject:", error);
      return res.status(500).send({
        statusCode: 500,
        status: false,
        message: error.message || "Internal server error",
        data: [],
      });
    }
  };
  
  exports.projectTypes = (req, res, next) => {
    if (typeof req.userId === "undefined") {
      return res.status(400).send({
        statusCode: 400,
        status: false,
        message: "User was not found",
        data: [],
      });
    } else {
      let skill_names = [];
      Skills.findAll()
        .then(skills => {
          if (!Array.isArray(skills) || skills.length === 0) {
            console.log("No skills found or skills is not an array.");
            return;
          }
  
          skills.forEach(skill => {
            skill_names.push({
              name: skill.name,
              category: skill.categoryid,
            });
          });
  
          skill_names.forEach(async (skill) => {
            const projectType = await Project.findOne({
              where: { name: skill.name },
            });
  
            if (!projectType) {
              await Project.create({
                name: skill.name,
                description: skill.name,
              });
            }
          });
  
          let tradesmen = [];
          let technicians = [];
          let professionals = [];
  
          skill_names.forEach((skill) => {
            Project.findOne({
              where: { name: skill.name },
            }).then(projectType => {
              if (projectType) {
                const category = skill.category;
                const projectTypeObj = {
                  project_type_id: projectType.id,
                  project_type_name: projectType.name,
                };
                if (category === 1) {
                  tradesmen.push(projectTypeObj);
                } else if (category === 2) {
                  technicians.push(projectTypeObj);
                } else if (category === 3) {
                  professionals.push(projectTypeObj);
                }
              }
            });
          });
  
          let jobs = [];
          const userId = req.userId || '';
          const searchCondition = userId ? { 'customerid': userId } : { 'customerid': { $not: null } };
  
          Projects.findAll({ where: searchCondition })
            .then(projects => {
              if (Array.isArray(projects) && projects.length) {
                projects.forEach((project) => {
                  if (project.wocmanid && project.projectcomplete !== 1) {
                    jobs.push({
                      description: project.description,
                      wocmanid: project.wocmanid,
                      images: project.images,
                      jobTypeid: project.projectid,
                      jobid: project.id,
                    });
                  }
                });
              }
              res.status(200).send({
                statusCode: 200,
                status: true,
                message: "Jobs And Job Types",
                data: {
                  accessToken: req.token,
                  jobs: jobs,
                  tradesmen_jobTypes: tradesmen,
                  technicians_jobTypes: technicians,
                  professionals_jobTypes: professionals,
                },
              });
            })
            .catch(err => {
              res.status(500).send({
                statusCode: 500,
                status: false,
                message: err.message,
                data: [],
              });
            });
        })
        .catch(err => {
          res.status(500).send({
            statusCode: 500,
            status: false,
            message: err.message,
            data: [],
          });
        });
    }
  };
  

