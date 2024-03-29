const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;
const Projects = db.Projects;
const Project = db.Projecttype;
const WCChat = db.WcChat;
const Skills = db.Skills;
const Wskills = db.Wskills;
const Category = db.Category;

const Helpers = require(pathRoot+"helpers/helper.js");
const { verifySignUp } = require(pathRoot+"middleware");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");

const Op = db.Sequelize.Op;
exports.wocstation_details = (req, res, next) => {
    
    User.findByPk(req.userId).then(user => {
        if (!user) {
            res.status(404).send({
                statusCode: 404,
                status: false,
                message: "User Not Found",
                data: []
            });
            return;
        }

        var chatLimit =  10;
        var perPage =  10;
        var page =  1;

        var offsetd = parseInt(perPage, 10) * (parseInt(page, 10)-1);
        var chatLimit = parseInt(chatLimit, 10);

        Projects.findOne({ where:{ 'customerid': req.userId, 'projectcomplete': '0' } }).then(async project => {
            if (!project) {
                res.status(404).send({
                    statusCode: 404,
                    status: false,
                    Project: "Project Nodt Found",
                    data: []
                });
                return;
            }
            
            Project.findByPk(project.projectid).then(async projecttype => {
                if (!projecttype) {
                    res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Project Type Not Found",
                        data: []
                    });
                    return;
                }

                var wpWocman = [];
                var wpChat = [];
                var wpCustomer = [];

                var wpProjectr = [];
                if (parseInt(project.wocmanaccept, 10) == 1) {
                    var wocmanAccept = true;
                }else{
                    var wocmanAccept = false;
                }

                if (parseInt(project.customerstart, 10) == 1) {
                    var customerstart = true;
                }else{
                    var customerstart = false;
                }

                if (parseInt(project.customeracceptcomplete, 10) == 1) {
                    var customeracceptcomplete = true;
                }else{
                    var customeracceptcomplete = false;
                }

                if (parseInt(project.projectcomplete, 10) == 1) {
                    var projectcomplete = true;
                }else{
                    var projectcomplete = false;
                }
                var images_for_project = project.images.split(Helpers.padTogether());

                wpCustomer.push(
                    [
                        {
                            customer_username: user.username,
                            customer_firstname: user.firstname,
                            customer_lastname: user.lastname,
                            customer_phone: user.phone,
                            customer_image: user.image
                        }
                    ]
                );
                wpProjectr.push(
                    [
                        {
                            id: project.id,
                            project_type_name: projecttype.name,
                            project_type_description: projecttype.description,
                            project: project.project,
                            project_description: project.description,
                            project_address: project.address,
                            project_city: project.city,
                            project_date_schedule: project.datetimeset,
                            project_country: project.country,
                            project_state: project.state,
                            Project_Images: images_for_project,
                            project_quotation_amount: project.quoteamount,
                            project_isWocmanAccept: wocmanAccept,
                            project_wocmanStartDate: project.wocmanstartdatetime,
                            project_isCustomerAcceptStart: customerstart,
                            project_customerReports: project.projectreport,
                            project_wocmanStopDate: project.wocmanstopdatetime,
                            project_isCustomerAcceptComplete: customeracceptcomplete,
                            project_CustomerRateWocman: project.customerratewocman,
                            project_adminProjectComplete: projectcomplete,
                            Project_created_on: project.createdAt
                        }
                    ]
                );

                User.findByPk(project.wocmanid).then(async wocman_project_user => {

                    // Make sure to wait on all your sequelize CRUD calls
                    Wskills.findAll({ where:{'userid': project.wocmanid}}).then(async skills => {

                        for await (const skill of skills){


                            const skill_now = await Skills.findOne({ where: {'id': skill.skillid} })
                            
                            const category = await Category.findByPk(skill_now.categoryid)

                            let cartItem3 = {}

                            cartItem3.wocman_username = wocman_project_user.username,
                            cartItem3.wocman_name = wocman_project_user.firstname+ " " +wocman_project_user.lastname,
                            cartItem3.wocman_phone = wocman_project_user.phone,
                            cartItem3.wocman_email = wocman_project_user.email,
                            cartItem3.wocman_address = wocman_project_user.address,
                            cartItem3.wocman_country = wocman_project_user.country,
                            cartItem3.wocman_image = wocman_project_user.image,
                            cartItem3.wocman_skill_category = category.name,
                            cartItem3.wocman_skill_name = skill_now.name,
                            cartItem3.wocman_skill_description = skill_now.description
                           
                            wpWocman.push(cartItem3)
                        }

                        WCChat.findAll({
                            where: {
                                senderid: {
                                    [Op.or]: [ parseInt(project.wocmanid, 10), parseInt(req.userId, 10)]
                                },
                                receiverid: {
                                    [Op.or]: [ parseInt(project.wocmanid, 10), parseInt(req.userId, 10)]
                                },
                                projectid: project.projectid
                            },
                            offset: offsetd,
                            limit: chatLimit,
                            order: [
                                ["createdAt", "DESC"]
                            ],
                        }).then(async chats => {

                            for await (const chat of chats){

                                if(parseInt(chat.seen, 10) == 0){ var hasSeen = false }else{  var hasSeen = true };
                                var images_for_chat = chat.messagelinks.split(Helpers.padTogether());

                                let cartItem3 = {}

                                cartItem3.chat = chat.message,
                                cartItem3.chatTime = chat.chattime,
                                cartItem3.chatType = chat.messagetype,
                                cartItem3.chatLinks = images_for_chat,
                                cartItem3.seen = hasSeen

                                wpChat.push(cartItem3)
                            }
                            res.send({
                                accessToken: req.token,
                                project: wpProjectr,
                                Customer: wpCustomer,
                                Wocman: wpWocman,
                                chat: wpChat
                            });
                        }).catch(err => {
                            res.status(500).send({
                                statusCode: 500,
                                status: false, 
                                message: err.message,
                                data: [] 
                            });
                        });
                    }).catch(err => {
                        res.status(500).send({
                            statusCode: 500,
                            status: false, 
                            message: err.message,
                            data: [] 
                        });
                    });
                }).catch(err => {
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