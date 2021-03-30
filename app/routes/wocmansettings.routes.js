const { authJwt } = require("../middleware");

const wocmanSettings = require("../controllers/users/wocman/auth/settings/wocmansettings.controller");
const wocmansmsSettings = require("../controllers/users/wocman/auth/settings/wocmansmssettings.controller");
const wocmanemailSettings = require("../controllers/users/wocman/auth/settings/wocmanemailsettings.controller");
const wocmanserviceSettings = require("../controllers/users/wocman/auth/settings/wocmanservicesettings.controller");
const wocmantechnicalSettings = require("../controllers/users/wocman/auth/settings/wocmantechnicalsettings.controller");

const wocman2FASettings = require("../controllers/users/wocman/auth/settings/wocman2fsettings.controller");
const wocmanIPASettings = require("../controllers/users/wocman/auth/settings/wocmanipaddresssettings.controller");
const wocmanUPDPSDSettings = require("../controllers/users/wocman/auth/settings/wocmanupdatepasswordsettings.controller");
const wocmanWalletSettings = require("../controllers/users/wocman/auth/settings/wocmanwalletinfosettings.controller");
const wocmanPSSettings = require("../controllers/users/wocman/auth/settings/wocmanpaymentschedulesettings.controller");
const wocmanDeviceSettings = require("../controllers/users/wocman/auth/settings/wocmanlogindevicesettings.controller");


const Helpers = require("../helpers/helper.js");

const path = require("path");
const multer = require("multer");

var storageCert = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('', 'app/', 'uploads/wocman/certificate'))
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
        Helpers.apiVersion7() + "wocman/settings/create",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanSettings.createsettings
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/get",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanSettings.settings
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/activate/sms",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmansmsSettings.smsNotice
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/cancel/sms",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmansmsSettings.nsmsNotice
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/activate/email",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanemailSettings.emailNotice
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/cancel/email",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanemailSettings.nemailNotice
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/activate/service",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanserviceSettings.serviceNotice
    );
    app.post(
        Helpers.apiVersion7() + "wocman/settings/cancel/service",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanserviceSettings.nserviceNotice
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/activate/technical",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmantechnicalSettings.technicalNotice
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/cancel/technical",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmantechnicalSettings.ntechnicalNotice
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/activate/2fa",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocman2FASettings.w2fsettings
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/cancel/2fa",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocman2FASettings.nw2fsettings
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/activate/ipa",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanIPASettings.wipsettings
    );
    
    app.post(
        Helpers.apiVersion7() + "wocman/settings/cancel/ipa",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanIPASettings.nwipsettings
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/edit/password",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanUPDPSDSettings.wocmanChangePassword
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/get/wallet",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanWalletSettings.wwDetails
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/edit/bankdetails",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanWalletSettings.wchangeBankDetails
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/weekly/paymentschedule",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanPSSettings.wpssettings
    );
    
    app.post(
        Helpers.apiVersion7() + "wocman/settings/monthly/paymentschedule",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanPSSettings.nwpssettings
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/blacklist/device",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanDeviceSettings.blacklistsettings
    );

    app.post(
        Helpers.apiVersion7() + "wocman/settings/allow/device",
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanDeviceSettings.allowsettings
    );
};