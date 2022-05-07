const db = require("../models");
const config = require("../config/auth.config");
const User = db.User;
const UserRole = db.UserRole;
const Role = db.Role;
const Cert = db.Cert;
const Wsetting = db.Wsetting;
const {v4 : uuidv4} = require('uuid');
const joi = require('joi');

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


const messagebird = require('messagebird')(config.otpId);
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
 
let options = {
  provider: 'openstreetmap'
};

let transporter = nodemailer.createTransport({
    host: config.message_server,
    port: 465,
    secure: true,
    auth: {
        user: config.email,
        pass: config.password,
    },
});

let MailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: config.name,
        link: config.website,
    },
});

const getRoleById = (role_id) => {
    Role.findOne({
      where: role_id
    })
    .then(role => {
        if (!role) {
            return false;
        }
        return role.name;
    });
};

const getUserRoleById = (user_id) => {
    UserRole.findOne({
      where:  user_id
    })
    .then(userroles => {
        if (!userroles) {
            return 0;
        }
        return userroles.roleid;
    });
};

const getRoleByName = (role_name) => {
    Role.findOne({
      where: role_id 
    })
    .then(role => {
        if (!role) {
            return false;
        }
        return role.id;
    });
};

const getUserByEmail = (email) => {
    User.findOne({
      where: email 
    })
    .then(users => {
        if (!users) {
            return 1;
        }
        return users.id;
    });
};
const getUserByUsername = (username) => {
    User.findOne({
      where: username 
    })
    .then(users => {
        if (!users) {
            return 1;
        }
        return users.id;
    });
};

const kfgetEmailLink = (premirelink) => {
    User.findOne({
      where: premirelink 
    })
    .then(users => {
        var data = {id: users.id, email: users.email};
        if (!data) {
            return 1;
        }
        return data;
    });
};

const apiVersion7 = () => { 
  return config.version; 
};
const coreProjectPath = () => {
    return config.coreRootFolder;
}
const pathToImages = () => {
    return config.coreImageFloder;
}
const padTogether = () => {
    return config.split;
}

const checkImageLink = (image_url, good, bad) => {
    var img = new Image();
    img.onload = good;
    img.onerror = bad;
    img.src = image_url;
    // http.open('HEAD', image_url, false);
    // http.send();
    // return http.status != 404;
}
const filterFile = (req, file, cb) => {
    if (typeof req === "undefined") {

    }else{
        console.log(req);
        if (!req.file.originalname.match(/\(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
            req.fileValidationError = "Only image files are allowed";
            return cb(new Error("Only image files are allowed"), false);
        }
        if (req.file.size > 100) {
            req.fileValidationError = "Max file size is less than 0.1MB";
            return cb(new Error("Max file size is less than 0.1MB"), false);
        }
        cb(null, true);
    }
};

const getJsondata = (stringValue, key) => {
    var string = JSON.stringify(stringValue);
    var objectValue = JSON.parse(string);
    return objectValue[key];
}

const returnBoolean = (value) => {
	if(value === 1){
		return true;
	}
	if(value === 0){
		return false;
	}
	if(value === '1'){
		return true;
	}
	if(value === '0'){
		return false;
	}
	if(value === 'null'){
		return false;
	}
	if(value === null){
		return false;
	}
	return value;
}

const notice_pusher = (userId, noticeBody, noticeType) => {
    User.findByPk(userId)
    .then(users => {
        if (!users) {
            return false;
        }
        Wsetting.findOne(
            {where: {userid: userId}}
        )
        .then(userSettings => {
            if (!userSettings) {
                return false;
            }
            var smsMode = parseInt(userSettings.smsnotice, 10);
            var emailMode = parseInt(userSettings.emailnotice, 10);

            var serviceType = parseInt(userSettings.servicenotice, 10);
            var technicalType = parseInt(userSettings.technicalnotice, 10);

            if (noticeType == 'service') {
                var pusherSubject = 'Wocman Technology: Services';
                if (serviceType === 1) {
                    if (emailMode === 1) {

                        var sentMail = false;

                        const pusherEmail = users.email;
                        const pusherUsername = users.username;
                        const pusherPhone = users.phone;

                        let response = {
                            body: {
                              name: pusherUsername,
                              intro: noticeBody,
                            },
                        };
                        let mail = MailGenerator.generate(response);

                        let message = {
                            from: config.email,
                            to:  pusherEmail,
                            subject: pusherSubject,
                            html: mail,
                        };

                        transporter.sendMail(message)
                        .then(  sentMails => {
                            var sentMail = true;
                        })
                        return sentMail;
                    }
                    if (smsMode === 1) {

                        var messageParams = {
                          'originator': 'MessageBird',
                          'recipients': [
                            pusherPhone
                        ],
                          'body': noticeBody
                        };

                        messagebird.messages.create(messageParams, function (err, response) {
                            if (err) {
                                return false;
                            }
                            return true;
                        });
                    }
                }
            }
            if (noticeType == 'technical') {
                var pusherSubject = 'Wocman Technology: Technical';

                if (technicalType === 1) {
                    if (emailMode === 1) {

                        var sentMail = false;

                        const pusherEmail = users.email;
                        const pusherUsername = users.username;
                        const pusherPhone = users.phone;

                        let response = {
                            body: {
                              name: pusherUsername,
                              intro: noticeBody,
                            },
                        };
                        let mail = MailGenerator.generate(response);

                        let message = {
                            from: config.email,
                            to:  pusherEmail,
                            subject: pusherSubject,
                            html: mail,
                        };

                        transporter.sendMail(message)
                        .then(  sentMails => {
                            var sentMail = true;
                        })
                        return sentMail;
                    }
                    if (smsMode === 1) {

                        var messageParams = {
                          'originator': 'MessageBird',
                          'recipients': [
                            pusherPhone
                        ],
                          'body': noticeBody
                        };

                        messagebird.messages.create(messageParams, function (err, response) {
                            if (err) {
                                return false;
                            }
                            return true;
                        });
                    }
                }
            }
        });
    });
};

const Helpers = {
    getRoleById: getRoleById,
    getRoleByName: getRoleByName,
    getUserRoleById: getUserRoleById,
    apiVersion7: apiVersion7,
    getUserByEmail: getUserByEmail,
    getUserByUsername: getUserByUsername,
    kfgetEmailLink: kfgetEmailLink,
    filterFile: filterFile,
    coreProjectPath: coreProjectPath,
    pathToImages: pathToImages,
    padTogether: padTogether,
    checkImageLink: checkImageLink,
    EMAIL: config.email,    
    PASSWORD: config.password, 
    MAIN_URL: config.resolve+config.port,
    getJsondata: getJsondata,
    returnBoolean: returnBoolean,
    pushNotice: notice_pusher
};

module.exports = Helpers;