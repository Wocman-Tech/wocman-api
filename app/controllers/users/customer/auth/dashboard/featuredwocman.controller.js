const pathRoot = '../../../../../';
const db = require(pathRoot + "models");
const config = require(pathRoot + "config/auth.config");

const AWS = require('aws-sdk');
const { createProject } = require('../../../../../service/customer/project.service');
const validator = require('../../../../../validation/project.validation')
AWS.config.region = 'us-east-2';

const s3 = new AWS.S3({
    sslEnabled: true,
    accessKeyId: config.awsS3AccessKeyId,
    secretAccessKey: config.awsS3SecretAccessKey
})

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
            projecttypeid: req.body.projecttypeid
        }
        const { error } = await validator.createProject(body);
        if (error) {
            return res.status(400).send(
                {
                    statusCode: 400,
                    status: false,
                    message: error.message.replace(/[\"]/gi, ''),
                    data: []
                });
        }
        const project = await createProject(req.body, req.userId, req.files);
        const message = 'Project created successfully';
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
            message: error.message || 'Internal server error',
            data: []
        });
    }
};

// exports.uploadProject = (req, res, next) => {
//     if (typeof req.userId == "undefined") {
//         return res.status(400).send(
//             {
//                 statusCode: 400,
//                 status: false,
//                 message: "User was not found",
//                 data: []
//             });
//     } else {

//         var project_topic = req.body.topic;
//         var decription = req.body.decription;
//         var address = req.body.address;
//         var city = req.body.city;
//         var projecttypeid = req.body.projecttypeid;
//         // data cleaning

//         //schema
//         const joiClean = Joi.object().keys({
//             decription: Joi.string().required(),
//             address: Joi.string().required(),
//             city: Joi.string().required(),
//             project_topic: Joi.string().required(),
//             projecttypeid: Joi.number().required()
//         });
//         const dataToValidate = {
//             decription: decription,
//             address,
//             city,
//             project_topic,
//             projecttypeid,
//         }
//         const result = joiClean.validate(dataToValidate);
//         if (result.error == null) {

//             var customer_id = req.userId;

//             var project_id = projecttypeid;//i want the admin to study this request and tie it to the appropriate project type.
//             //inserting into the project table

//             const file = req.files;//this are the file

//             //create one
//             Projects.create({
//                 project: project_topic,
//                 description: decription,
//                 address: address,
//                 city: city,
//                 projectid: project_id,
//                 customerid: customer_id,
//                 images: ''
//             })
//                 .then(projectCallback => {
//                     var images = [];
//                     file.map((item) => {
//                         let myFile = item.originalname.split(".")
//                         const fileType = myFile[myFile.length - 1]
//                         const dsf = uuidv4();

//                         var params = {
//                             ACL: "public-read-write",
//                             Bucket: config.awsS3BucketName,
//                             Key: item.originalname,
//                             Body: item.buffer
//                         }

//                         s3.upload(params, (error, data, res) => {
//                             if (error) {
//                                 // res.status(500).send(error)
//                                 console.log(error);
//                             } else {
//                                 var fileUrl = data.Location;
//                                 if (typeof fileUrl === 'undefined') {
//                                     //empty file
//                                 } else {
//                                     images.push({ fileUrl });
//                                 }
//                             }
//                             // console.log(images);
//                             // save project
//                             var all_image_url = '';
//                             for (var i = 0; i < images.length; i++) {
//                                 if (i == 0) {
//                                     all_image_url = images[i].fileUrl;
//                                 } else {
//                                     all_image_url = all_image_url + Helpers.padTogether() + images[i].fileUrl;
//                                 }
//                             }
//                             Projects.update(
//                                 {
//                                     images: all_image_url
//                                 },
//                                 {
//                                     where: { 'description': decription }
//                                 }
//                             );
//                         });
//                     });

//                     // return
//                     res.status(201).send({
//                         statusCode: 201,
//                         status: true,
//                         message: "Project Created",
//                         data: {
//                             accessToken: req.token
//                         }
//                     });
//                 })
//                 .catch(err => {
//                     res.status(500).send({
//                         statusCode: 500,
//                         status: false,
//                         message: err.message,
//                         data: []
//                     });
//                 });
//         }
//     }
// };

exports.projectTypes = (req, res, next) => {
    if (typeof req.userId == "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "User was not found",
                data: []
            });
    } else {
        //synchronize project type with skills
        var skill_names = [];
        Skills.findAll()
            .then(skills => {
                if (!skills) { } else {
                    if (!Array.isArray(skills) || !skills.length) {
                    } else {
                        for (let i = 0; i < skills.length; i++) {
                            skill_names.push({
                                name: skills[i].name,
                                category: skills[i].categoryid
                            })
                        }
                    }
                }

                for (var if2 = 0; if2 < skill_names.length; if2++) {
                    let skill2 = skill_names[if2]['name'];
                    Project.findOne({
                        where: { 'name': skill2 }
                    })
                        .then(projectTypes => {
                            if (projectTypes) {//already exist
                            } else {
                                //insert
                                Project.create({
                                    name: skill2,
                                    description: skill2
                                })
                            }
                        });
                }



                let tradesmen = [];
                let technicians = [];
                let professionals = [];


                for (var if2 = 0; if2 < skill_names.length; if2++) {
                    let skill2 = skill_names[if2]['name'];
                    let skill_category_id = parseInt(skill_names[if2]['category'], 10);
                    Project.findOne({
                        where: { 'name': skill2 }
                    })
                        .then(projectTypes => {
                            if (projectTypes) {//already exist

                                if (skill_category_id == 1) {
                                    tradesmen.push({
                                        project_type_id: projectTypes.id,
                                        project_type_name: projectTypes.name
                                    })
                                }

                                if (skill_category_id == 2) {
                                    technicians.push({
                                        project_type_id: projectTypes.id,
                                        project_type_name: projectTypes.name
                                    })
                                }

                                if (skill_category_id == 3) {
                                    professionals.push({
                                        project_type_id: projectTypes.id,
                                        project_type_name: projectTypes.name
                                    })
                                }
                            }
                        });
                }


                var customer_id = req.userId;

                let jobs = [];


                if (req.userId && req.userId !== '') {
                    Searchuserid = { 'customerid': req.userId };
                } else {
                    Searchuserid = { 'customerid': { $not: null } };
                }

                Projects.findAll({
                    where: Searchuserid
                })
                    .then(projects => {
                        if (!projects) { } else {
                            if (!Array.isArray(projects) || !projects.length) {
                            } else {
                                for (let i = 0; i < projects.length; i++) {

                                    if (typeof projects[i] == "undefined") {
                                    } else {
                                        if (parseInt(projects[i].wocmanid, 10) > 0 && parseInt(projects[i].projectcomplete, 10) != 1) {
                                            jobs.push({
                                                description: projects[i].description,
                                                wocmanid: projects[i].wocmanid,
                                                images: projects[i].images,
                                                jobTypeid: projects[i].projectid,
                                                jobid: projects[i].id
                                            })
                                        }
                                    }
                                }
                            }
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
