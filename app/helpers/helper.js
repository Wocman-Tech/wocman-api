const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const UserRole = db.userRole;
const Cert = db.cert;
const {v4 : uuidv4} = require('uuid');
const joi = require('joi');

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

getRoleById = (role_id) => {
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

getUserRoleById = (user_id) => {
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

getRoleByName = (role_name) => {
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

getUserByEmail = (email) => {
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
getUserByUsername = (username) => {
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

kfgetEmailLink = (premirelink) => {
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

apiVersion7 = () => { 
  return config.version; 
};
coreProjectPath = () => {
    return config.coreRootFolder;
}
pathToImages = () => {
    return config.coreImageFloder;
}
padTogether = () => {
    return config.split;
}

checkImageLink = (image_url, good, bad) => {
    var img = new Image();
    img.onload = good;
    img.onerror = bad;
    img.src = image_url;
    // http.open('HEAD', image_url, false);
    // http.send();
    // return http.status != 404;
}
filterFile = (req, file, cb) => {
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

getJsondata = (stringValue, key) => {
    var string = JSON.stringify(stringValue);
    var objectValue = JSON.parse(string);
    return objectValue[key];
}

returnBoolean = (value) => {
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
    returnBoolean: returnBoolean

};

module.exports = Helpers;