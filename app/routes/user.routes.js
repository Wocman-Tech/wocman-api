const { authJwt } = require("../middleware");

const addcertificateController = require("../controllers/users/wocman/auth/user/addcertificate.controller");
const changepasswordController = require("../controllers/users/wocman/auth/user/changepassword.controller");
const completeController = require("../controllers/users/wocman/auth/user/complete.controller");
const logoutController = require("../controllers/users/wocman/auth/user/logout.controller");
const profileController = require("../controllers/users/wocman/auth/user/profile.controller");
const removecertificateController = require("../controllers/users/wocman/auth/user/removecertificate.controller");
const reusepictureController = require("../controllers/users/wocman/auth/user/reusepicture.controller");
const updateprofileController = require("../controllers/users/wocman/auth/user/updateprofile.controller");
const profilepictureController = require("../controllers/users/wocman/auth/user/profilepicture.controller");

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

    //auth

    app.post(
        Helpers.apiVersion7()+"complete-profile-wocman",
        [authJwt.verifyToken, authJwt.isWocman],
        completeController.checkCompleteProfileWocman
    );

    app.post(
        Helpers.apiVersion7()+"profile-wocman",
        [authJwt.verifyToken, authJwt.isWocman],
        profileController.wocmanProfile
    );

    app.post(
        Helpers.apiVersion7()+"update-profile-wocman",
        [authJwt.verifyToken, authJwt.isWocman],
        updateprofileController.wocmanProfileUpdate
    );

    app.post(
        Helpers.apiVersion7()+"password-change-wocman",
        [authJwt.verifyToken, authJwt.isWocman],
        changepasswordController.wocmanChangePassword
    );

    app.post(
        Helpers.apiVersion7() + "wocman-reuse-profile-picture", 
        [authJwt.verifyToken, authJwt.isWocman], 
        reusepictureController.wocmanReuseProfilePicture
    );

    app.post(
        Helpers.apiVersion7() + "wocman-logout", 
        [authJwt.verifyToken, authJwt.isWocman], 
        logoutController.wocmanLogout
    );

    app.post(
        Helpers.apiVersion7() + "auth/wocman-profile-picture", 
        [authJwt.verifyToken, authJwt.isWocman, upload.single('avatar')], 
        profilepictureController.uploadProfilePictureWocman
    );
    //certificate

    app.post(
        Helpers.apiVersion7() + "wocman-add-certificate", 
        [authJwt.verifyToken, authJwt.isWocman, uploadCert.single('avatar')], 
        addcertificateController.wocmanAddCertificate
    );

    app.post(
        Helpers.apiVersion7() + "wocman-remove-certificate", 
        [authJwt.verifyToken, authJwt.isWocman], 
        removecertificateController.wocmanRemoveCertificate
    );


};