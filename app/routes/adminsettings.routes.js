const { authJwt } = require("../middleware");
const { isIdVerify, verifyAdminUser, rootAdmin, rootAction, initiateAdmin } = require("../middleware/admin");


const admin2FASettings = require("../controllers/users/admin/auth/settings/wocman2fsettings.controller");
const adminemailSettings = require("../controllers/users/admin/auth/settings/wocmanemailsettings.controller");
const adminIPASettings = require("../controllers/users/admin/auth/settings/wocmanipaddresssettings.controller");
const adminDeviceSettings = require("../controllers/users/admin/auth/settings/wocmanlogindevicesettings.controller");
const adminserviceSettings = require("../controllers/users/admin/auth/settings/wocmanservicesettings.controller");
const adminSettings = require("../controllers/users/admin/auth/settings/wocmansettings.controller");
const adminsmsSettings = require("../controllers/users/admin/auth/settings/wocmansmssettings.controller");
const admintechnicalSettings = require("../controllers/users/admin/auth/settings/wocmantechnicalsettings.controller");
const adminUPDPSDSettings = require("../controllers/users/admin/auth/settings/wocmanupdatepasswordsettings.controller");



const Helpers = require("../helpers/helper.js");

const path = require("path");
const multer = require("multer");

const  { verifyAdminSignUp } = require("../middleware/website/user/admin");


module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        Helpers.apiVersion7() + "admin/settings/activate/2fa", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        admin2FASettings.w2fsettings
    );

    app.post(
        Helpers.apiVersion7() + "admin/settings/deactivate/2fa", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        admin2FASettings.nw2fsettings
    );

    app.post(
        Helpers.apiVersion7() + "admin/settings/activate/email", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminemailSettings.emailNotice
    );

    app.post(
        Helpers.apiVersion7() + "admin/settings/deactivate/email", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminemailSettings.nemailNotice
    );

    app.post(
        Helpers.apiVersion7() + "admin/settings/activate/device", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminIPASettings.wipsettings
    );

    app.post(
        Helpers.apiVersion7() + "admin/settings/deactivate/device", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminIPASettings.nwipsettings
    );

    app.post(
        Helpers.apiVersion7() + "admin/settings/activate/device-blacklist", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminDeviceSettings.allowsettings
    );

    app.post(
        Helpers.apiVersion7() + "admin/settings/deactivate/device-blacklist", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminDeviceSettings.blacklistsettings
    );

    app.post(
        Helpers.apiVersion7() + "admin/settings/activate/service", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminserviceSettings.serviceNotice
    );

    app.post(
        Helpers.apiVersion7() + "admin/settings/deactivate/service", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminserviceSettings.nserviceNotice
    );

    app.post(
        Helpers.apiVersion7() + "admin/settings/view", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminSettings.settings
    );

    app.post(
        Helpers.apiVersion7() + "admin/settings/create", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminSettings.createsettings
    );

    app.post(
        Helpers.apiVersion7() + "admin/settings/activate/sms", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminsmsSettings.smsNotice
    );

    app.post(
        Helpers.apiVersion7() + "admin/settings/deactivate/sms", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminsmsSettings.nsmsNotice
    );

    app.post(
        Helpers.apiVersion7() + "admin/settings/activate/technical", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        admintechnicalSettings.technicalNotice
    );

    app.post(
        Helpers.apiVersion7() + "admin/settings/deactivate/technical", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        admintechnicalSettings.ntechnicalNotice
    );

    app.post(
        Helpers.apiVersion7() + "admin/settings/password/change", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminUPDPSDSettings.wocmanChangePassword
    );
};
