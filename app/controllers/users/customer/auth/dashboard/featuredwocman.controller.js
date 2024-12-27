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
      const body = {
        description: req.body.description,
        address: req.body.address,
        city: req.body.city,
        topic: req.body.topic,
        projecttypeid: req.body.projecttypeid,
        startDate: req.body.startDate,
      };
  
      const { error } = await validator.createProject(body);
      if (error) {
        return res.status(400).send({
          statusCode: 400,
          status: false,
          message: error.message.replace(/[\"]/gi, ""),
          data: [],
        });
      }
  
      let imageUrls = []; // Collect uploaded file URLs
  
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          let myFile = file.originalname.split(".");
          const fileType = myFile[myFile.length - 1];
          const dsf = `${Date.now()}.${fileExtension}`;
  
          const params = {
            Bucket: config.awsS3BucketName, // Your S3 bucket name
            Key: `${dsf}.${fileType}`, // Unique file key
            Body: file.buffer, // File content
            ContentType: file.mimetype, // Ensure correct content type
          };
  
          try {
            const uploadCommand = new PutObjectCommand(params);
            await s3.send(uploadCommand);
  
            const fileUrl = `https://${config.awsS3BucketName}.s3.amazonaws.com/${dsf}.${fileType}`;

            imageUrls.push(fileUrl);
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
  
      // Concatenate image URLs for storage (if needed)
      const images = imageUrls.join("/XX98XX");
  
      // Pass images as part of the project data
      const projectData = { ...req.body, images };
      const project = await createProject(projectData, req.userId);
  
      const message = "Project created successfully";
      return res.status(201).json({
        statusCode: 201,
        status: true,
        message,
        data: project,
      });
    } catch (error) {
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
            data: []
        });
    } else {
        // Synchronize project type with skills
        let skill_names = [];
        Skills.findAll()
            .then(skills => {
                if (!skills) { 
                    return;
                } else {
                    if (Array.isArray(skills) && skills.length) {
                        for (let skill of skills) {
                            skill_names.push({
                                name: skill.name,
                                category: skill.categoryid
                            });
                        }
                    }
                }

                // Insert project types based on skill names
                skill_names.forEach(async (skill) => {
                    const projectType = await Project.findOne({
                        where: { name: skill.name },
                    });

                    if (!projectType) {
                        // Insert new project type if not found
                        await Project.create({
                            name: skill.name,
                            description: skill.name,
                        });
                    }
                });

                let tradesmen = [];
                let technicians = [];
                let professionals = [];

                // Categorize skill names based on their category
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

                // Fetch projects for the user
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
                                        jobid: project.id
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
                                professionals_jobTypes: professionals
                            }
                        });
                    })
                    .catch(err => {
                        res.status(500).send({
                            statusCode: 500,
                            status: false,
                            message: err.message,
                            data: []
                        });
                    });
            })
            .catch(err => {
                res.status(500).send({
                    statusCode: 500,
                    status: false,
                    message: err.message,
                    data: []
                });
            });
    }
};

