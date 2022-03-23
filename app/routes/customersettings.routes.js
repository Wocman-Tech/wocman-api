const { authJwt } = require("../middleware");

const wocmanSettings = require("../controllers/users/customer/auth/settings/wocmansettings.controller");
const wocmansmsSettings = require("../controllers/users/customer/auth/settings/wocmansmssettings.controller");
const wocmanemailSettings = require("../controllers/users/customer/auth/settings/wocmanemailsettings.controller");
const wocmanserviceSettings = require("../controllers/users/customer/auth/settings/wocmanservicesettings.controller");
const wocmantechnicalSettings = require("../controllers/users/customer/auth/settings/wocmantechnicalsettings.controller");

const wocman2FASettings = require("../controllers/users/customer/auth/settings/wocman2fsettings.controller");
const wocmanIPASettings = require("../controllers/users/customer/auth/settings/wocmanipaddresssettings.controller");
const wocmanUPDPSDSettings = require("../controllers/users/customer/auth/settings/wocmanupdatepasswordsettings.controller");
const wocmanWalletSettings = require("../controllers/users/customer/auth/settings/wocmanwalletinfosettings.controller");
const wocmanPSSettings = require("../controllers/users/customer/auth/settings/wocmanpaymentschedulesettings.controller");
const wocmanDeviceSettings = require("../controllers/users/customer/auth/settings/wocmanlogindevicesettings.controller");


const Helpers = require("../helpers/helper.js");

const path = require("path");
const multer = require("multer");



module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    //chat end points

    app.post(
        Helpers.apiVersion7() + "customer/settings/create",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanSettings.createsettings
    );

    app.get(
        Helpers.apiVersion7() + "customer/settings/get",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanSettings.settings
    );

    app.put(
        Helpers.apiVersion7() + "customer/settings/activate/sms",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmansmsSettings.smsNotice
    );

    app.put(
        Helpers.apiVersion7() + "customer/settings/cancel/sms",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmansmsSettings.nsmsNotice
    );

    app.put(
        Helpers.apiVersion7() + "customer/settings/activate/email",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanemailSettings.emailNotice
    );

    app.put(
        Helpers.apiVersion7() + "customer/settings/cancel/email",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanemailSettings.nemailNotice
    );

    app.put(
        Helpers.apiVersion7() + "customer/settings/activate/service",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanserviceSettings.serviceNotice
    );
    app.put(
        Helpers.apiVersion7() + "customer/settings/cancel/service",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanserviceSettings.nserviceNotice
    );

    app.put(
        Helpers.apiVersion7() + "customer/settings/activate/technical",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmantechnicalSettings.technicalNotice
    );

    app.put(
        Helpers.apiVersion7() + "customer/settings/cancel/technical",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmantechnicalSettings.ntechnicalNotice
    );

    app.put(
        Helpers.apiVersion7() + "customer/settings/activate/2fa",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocman2FASettings.w2fsettings
    );

    app.put(
        Helpers.apiVersion7() + "customer/settings/cancel/2fa",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocman2FASettings.nw2fsettings
    );

    app.put(
        Helpers.apiVersion7() + "customer/settings/activate/ipa",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanIPASettings.wipsettings
    );
    
    app.put(
        Helpers.apiVersion7() + "customer/settings/cancel/ipa",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanIPASettings.nwipsettings
    );

    app.put(
        Helpers.apiVersion7() + "customer/settings/edit/password",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanUPDPSDSettings.wocmanChangePassword
    );

    app.put(
        Helpers.apiVersion7() + "customer/settings/get/wallet",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanWalletSettings.wwDetails
    );

    app.put(
        Helpers.apiVersion7() + "customer/settings/edit/bankdetails",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanWalletSettings.wchangeBankDetails
    );

    app.put(
        Helpers.apiVersion7() + "customer/settings/weekly/paymentschedule",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanPSSettings.wpssettings
    );
    
    app.put(
        Helpers.apiVersion7() + "customer/settings/monthly/paymentschedule",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanPSSettings.nwpssettings
    );

    app.put(
        Helpers.apiVersion7() + "customer/settings/blacklist/device",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanDeviceSettings.blacklistsettings
    );

    app.put(
        Helpers.apiVersion7() + "customer/settings/allow/device",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanDeviceSettings.allowsettings
    );
};