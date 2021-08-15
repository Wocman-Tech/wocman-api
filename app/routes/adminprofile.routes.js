const { authJwt } = require("../middleware");
const { isIdVerify, verifyAdminUser, rootAdmin, rootAction, initiateAdmin } = require("../middleware/admin");

const completeController = require("../controllers/users/admin/auth/profile/complete.controller");
const logoutController = require("../controllers/users/admin/auth/profile/logout.controller");
const profilepictureController = require("../controllers/users/admin/auth/profile/profilepicture.controller");
const removepictureController = require("../controllers/users/admin/auth/profile/removepicture.controller");
const reusepictureController = require("../controllers/users/admin/auth/profile/reusepicture.controller");
const updateprofileController = require("../controllers/users/admin/auth/profile/updateprofile.controller");

const Helpers = require("../helpers/helper.js");

const path = require("path");
const multer = require("multer");

var storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, '');
    }
});
const uploadJob = multer({storage: storage}).single('avatar')

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        Helpers.apiVersion7() + "admin/profile/complete", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        completeController.checkCompleteProfile
    );

    app.post(
        Helpers.apiVersion7() + "admin/profile/logout", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        logoutController.adminLogout
    );

    app.post(
        Helpers.apiVersion7() + "admin/profile/picture", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction, uploadJob],
        profilepictureController.uploadProfilePicture
    );

    app.post(
        Helpers.apiVersion7() + "admin/profile/remove/picture", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        removepictureController.removeProfilePicture
    );

    app.post(
        Helpers.apiVersion7() + "admin/profile/reuse/picture", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        reusepictureController.ReuseProfilePicture
    );

    app.post(
        Helpers.apiVersion7() + "admin/profile/update", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        updateprofileController.ProfileUpdate
    );
};