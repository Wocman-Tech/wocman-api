const { authJwt } = require("../middleware");

const authController = require("../controllers/auth.controller");

const wocmanAuthUserController = require("../controllers/users/wocman/auth/user.controller");
const wocmanAuthChatController = require("../controllers/users/wocman/auth/chat.controller");
const wocmanUserController = require("../controllers/users/wocman/wocman.controller");
const websiteController = require("../controllers/website/website.controller");

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

    //wocman end points

    app.get(
        Helpers.apiVersion7()+"wocman-signup-verification/:link",
        [],
        wocmanUserController.checkVerifyEmailLinkWocman
    );

    app.post(
        Helpers.apiVersion7()+"password-reset-wocman",
        [],
        wocmanUserController.wocmanResetPassword
    );

    app.get(
        Helpers.apiVersion7()+"wocman-password-reset/:link",
        [],
        wocmanUserController.wocmanResetPasswordConfirm
    );

    app.post(
        Helpers.apiVersion7()+"wocman-password-reset",
        [],
        wocmanUserController.wocmanStartResetPassword
    );

    //auth

    app.post(
        Helpers.apiVersion7()+"complete-profile-wocman",
        [authJwt.verifyToken, authJwt.isWocman],
        wocmanAuthUserController.checkCompleteProfileWocman
    );

    app.post(
        Helpers.apiVersion7()+"profile-wocman",
        [authJwt.verifyToken, authJwt.isWocman],
        wocmanAuthUserController.wocmanProfile
    );

    app.post(
        Helpers.apiVersion7()+"update-profile-wocman",
        [authJwt.verifyToken, authJwt.isWocman],
        wocmanAuthUserController.wocmanProfileUpdate
    );

    app.post(
        Helpers.apiVersion7()+"password-change-wocman",
        [authJwt.verifyToken, authJwt.isWocman],
        wocmanAuthUserController.wocmanChangePassword
    );

    app.post(
        Helpers.apiVersion7() + "wocman-reuse-profile-picture", 
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanAuthUserController.wocmanReuseProfilePicture
    );

    app.post(
        Helpers.apiVersion7() + "wocman-logout", 
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanAuthUserController.wocmanLogout
    );

    //certificate

    app.post(
        Helpers.apiVersion7() + "wocman-add-certificate", 
        [authJwt.verifyToken, authJwt.isWocman, uploadCert.single('avatar')], 
        wocmanAuthUserController.wocmanAddCertificate
    );

    app.post(
        Helpers.apiVersion7() + "wocman-remove-certificate", 
        [authJwt.verifyToken, authJwt.isWocman], 
        wocmanAuthUserController.wocmanRemoveCertificate
    );
};