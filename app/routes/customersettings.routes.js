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

var storageCert = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('', 'app/', 'uploads/customer/certificate'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+ path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});
var uploadCert = multer({ 
    storage: storageCert, 
    fileFilter : (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif") {
            cb(null, true);
        }else{
            cb(null, false);
            return cb(new Error('Only jpeg, jpg, png, gif file extensions are allowerd'));
        }
    }
});

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

    app.post(
        Helpers.apiVersion7() + "customer/settings/get",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanSettings.settings
    );

    app.post(
        Helpers.apiVersion7() + "customer/settings/activate/sms",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmansmsSettings.smsNotice
    );

    app.post(
        Helpers.apiVersion7() + "customer/settings/cancel/sms",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmansmsSettings.nsmsNotice
    );

    app.post(
        Helpers.apiVersion7() + "customer/settings/activate/email",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanemailSettings.emailNotice
    );

    app.post(
        Helpers.apiVersion7() + "customer/settings/cancel/email",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanemailSettings.nemailNotice
    );

    app.post(
        Helpers.apiVersion7() + "customer/settings/activate/service",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanserviceSettings.serviceNotice
    );
    app.post(
        Helpers.apiVersion7() + "customer/settings/cancel/service",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanserviceSettings.nserviceNotice
    );

    app.post(
        Helpers.apiVersion7() + "customer/settings/activate/technical",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmantechnicalSettings.technicalNotice
    );

    app.post(
        Helpers.apiVersion7() + "customer/settings/cancel/technical",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmantechnicalSettings.ntechnicalNotice
    );

    app.post(
        Helpers.apiVersion7() + "customer/settings/activate/2fa",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocman2FASettings.w2fsettings
    );

    app.post(
        Helpers.apiVersion7() + "customer/settings/cancel/2fa",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocman2FASettings.nw2fsettings
    );

    app.post(
        Helpers.apiVersion7() + "customer/settings/activate/ipa",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanIPASettings.wipsettings
    );
    
    app.post(
        Helpers.apiVersion7() + "customer/settings/cancel/ipa",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanIPASettings.nwipsettings
    );

    app.post(
        Helpers.apiVersion7() + "customer/settings/edit/password",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanUPDPSDSettings.wocmanChangePassword
    );

    app.post(
        Helpers.apiVersion7() + "customer/settings/get/wallet",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanWalletSettings.wwDetails
    );

    app.post(
        Helpers.apiVersion7() + "customer/settings/edit/bankdetails",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanWalletSettings.wchangeBankDetails
    );

    app.post(
        Helpers.apiVersion7() + "customer/settings/weekly/paymentschedule",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanPSSettings.wpssettings
    );
    
    app.post(
        Helpers.apiVersion7() + "customer/settings/monthly/paymentschedule",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanPSSettings.nwpssettings
    );

    app.post(
        Helpers.apiVersion7() + "customer/settings/blacklist/device",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanDeviceSettings.blacklistsettings
    );

    app.post(
        Helpers.apiVersion7() + "customer/settings/allow/device",
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocmanDeviceSettings.allowsettings
    );
};