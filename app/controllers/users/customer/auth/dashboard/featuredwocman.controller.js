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
            projecttypeid: req.body.projecttypeid,
            startDate: req.body.startDate
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
