const db = require("../../../../models");
const config = require("../../../../config/auth.config");
const fs = require('fs');
const User = db.user;
const Role = db.role;
const UserRole = db.userRole;
const Nletter = db.nletter;
const Contactus = db.contactus;
const Cert = db.cert;


const Projects = db.projects;
const Project = db.projecttype;
const Wshear = db.wshear;
const WAChat = db.waChat;
const WCChat = db.wcChat;
const WWallet = db.wWallet;

const {v4 : uuidv4} = require('uuid');
const Helpers = require("../../../../helpers/helper.js");
const { verifySignUp } = require("../../../../middleware");

let nodeGeocoder = require('node-geocoder');
 
let options = {
  provider: 'openstreetmap'
};


const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const { EMAIL, PASSWORD, MAIN_URL } = require("../../../../helpers/helper.js");

let transporter = nodemailer.createTransport({
  service: config.message_server,
  secure: true,
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
});

let MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: config.name,
    link: MAIN_URL,
  },
});



const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


// wocman routes

exports.wocmanAcceptProject = (req, res, next) => {
    // Username
    var projectid =  req.body.projectid;
    
    if (typeof projectid === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false, 
                message: "project  is undefined.",
                data: []
            }
        );
    }else{
        
        User.findByPk(req.userId).then(user => {
            if (!user) {
              res.status(404).send({
                 statusCode: 404,
                    status: false,
                    message: "User Not Found",
                    data: []
              });
            }
            Projects.findByPk(projectid).then(project => {
                if (!project) {
                  res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Project Not Found",
                        data: []
                  });
                }
                if (parseInt(project.wocmanid, 10) !== parseInt(req.userId, 10)) {
                    res.status(404).send({
                         statusCode: 404,
                        status: false,
                        message: "Project Not Owner not resolved",
                        data: []
                      });
                      return;
                }else{
                    project.update({
                        wocmanaccept:2
                    }).then(() => {
                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Project Accepted",
                            data: {
                                accessToken: req.token
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
                }
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

exports.wocmanRejectProject = (req, res, next) => {
    // Username
    var projectid =  req.body.projectid;
    
   
    if (typeof projectid === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "project  is undefined.",
                data: []
            }
        );
    }else{
        
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
            Projects.findByPk(projectid).then(project => {
                if (!project) {
                  res.status(404).send({
                     statusCode: 404,
                    status: false,
                    message: "Project Not Found",
                    data: []
                  });
                  return;
                }
                if (parseInt(project.wocmanid, 10) !== parseInt(req.userId, 10)) {
                    res.status(404).send({
                         statusCode: 404,
                        status: false,
                        message: "Project Not Owner not resolved",
                        data: []
                      });
                      return;
                }else{
                    project.update({
                        wocmanaccept:1
                    }).then(() => {
                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Project Rejected",
                            data: {
                                accessToken: req.token
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
                }
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

exports.wocmanStartProject = (req, res, next) => {
    // Username
    var projectid =  req.body.projectid;
    var projectstarttime = new Date();

    if (typeof projectid === "undefined") {
        return res.status(400).send(
            {
                 statusCode: 400,
                status: false,
                message: "project  is undefined." ,
                data: []
            }
        );
    }else{
       
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
            Projects.findByPk(projectid).then(project => {
                if (!project) {
                  res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Project Not Found",
                    data: []
                  });
                  return;
                }
                if (parseInt(project.wocmanid, 10) !== parseInt(req.userId, 10)) {
                    res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Project Not Owner not resolved",
                        data: []
                      });
                      return;
                }else{
                    project.update({
                        wocmanaccept:3,
                        wocmanstartdatetime: projectstarttime.toString()
                    }).then(() => {
                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Project Started",
                            data: {
                                accessToken: req.token
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
                }
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

exports.wocmanStopProject = (req, res, next) => {
    // Username
    var projectid =  req.body.projectid;
    var projectstarttime = new Date();

    if (typeof projectid === "undefined") {
        return res.status(400).send(
            {
                 statusCode: 400,
                status: false,
                message: "project  is undefined." ,
                data: []
            }
        );
    }else{
        
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
            Projects.findByPk(projectid).then(project => {
                if (!project) {
                  res.status(404).send({
                     statusCode: 404,
                    status: false,
                    message: "Project Not Found",
                    data: []
                  });
                  return;
                }
                if (parseInt(project.wocmanid, 10) !== parseInt(req.userId, 10)) {
                    res.status(404).send({
                         statusCode: 404,
                        status: false,
                        message: "Project Not Owner not resolved",
                        data: []
                      });
                      return;
                }else{
                    project.update({
                        wocmanstopdatetime: projectstarttime.toString()
                    }).then(() => {
                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Project stopped",
                            data: {
                                accessToken: req.token
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
                }
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

exports.wocmanCompleteProject = (req, res, next) => {
    // Username
    var projectid =  req.body.projectid;
    var projectstarttime = new Date();
    // console.log(projectstarttime);
    
    if (typeof projectid === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "project  is undefined.",
                data: [] 
            }
        );
    }else{
        
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
            Projects.findByPk(projectid).then(project => {
                if (!project) {
                    res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Project Not Found",
                        data: []
                    });
                  return;
                }
                if (parseInt(project.wocmanid, 10) !== parseInt(req.userId, 10)) {
                    res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "Project Not Owner not resolved",
                        data: []
                    });
                      return;
                }else{
                    project.update({
                        wocmanaccept:4,
                        wocmanstopdatetime: projectstarttime.toString()
                    }).then(() => {
                        res.status(200).send({
                            statusCode: 200,
                            status: true,
                            message: "Project Completed",
                            date: {
                                accessToken: req.token
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
                }
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

exports.wocmanProjectCustomer = (req, res, next) => {
    // Username
    var projectid =  req.body.projectid;
    
    if (typeof projectid === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "project  is undefined.",
                data: [] 
            }
        );
    }else{
        
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
            Projects.findByPk(projectid).then(project => {
                if (!project) {
                  res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Project Not Found",
                    data: []
                  });
                  return;
                }

                User.findByPk(project.customerid).then(customeruser => {
                if (!customeruser) {
                  res.status(404).send({
                    statusCode: 404,
                    status: false,
                    message: "Customer Not Found",
                    data: []
                  });
                  return;
                }
                })
                .then(() => {
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Customer was found",
                        data: {
                            accessToken: req.token,
                            custmer_username: customeruser.username,
                            custmer_firstname: customeruser.firstname,
                            custmer_lastname: customeruser.lastname,
                            custmer_address: customeruser.address,
                            custmer_country: customeruser.country
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

exports.wocmanProjectProject = (req, res, next) => {
    // Username
    var projectid =  req.body.projectid;
    
    if (typeof projectid === "undefined") {
        return res.status(400).send(
            { 
                statusCode: 400,
                status: false,
                message: "project  is undefined.",
                data: []
            }
        );
    }else{
        
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
            Projects.findByPk(projectid).then(project => {
                if (!project) {
                  res.status(404).send({
                    statusCode: 404,
                    status: false,
                    Project: "Project Not Found",
                    data: []
                  });
                  return;
                }

                Project.findByPk(project.projectid).then(projecttype => {
                    if (!projecttype) {
                      res.status(404).send({
                         statusCode: 404,
                        status: false,
                        message: "Project Type Not Found",
                        data: []
                      });
                      return;
                    }
                })
                .then(() => {
                    res.send({
                        accessToken: req.token,
                        project_type_name: projecttype.name,
                        project_type_description: projecttype.description
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
};
