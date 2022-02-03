const { authJwt } = require("../middleware");


const logoutController = require("../controllers/users/customer/auth/profile/logout.controller");
const closeaccountController = require("../controllers/users/customer/auth/profile/closeaccount.controller");

const profilepictureController = require("../controllers/users/customer/auth/profile/profilepicture.controller");
const reusepictureController = require("../controllers/users/customer/auth/profile/reusepicture.controller");
const removepictureController = require("../controllers/users/customer/auth/profile/removepicture.controller");

const updateprofileController = require("../controllers/users/customer/auth/profile/updateprofile.controller");
const ratingController = require("../controllers/users/customer/auth/profile/rating.controller");
const completeController = require("../controllers/users/customer/auth/profile/complete.controller");

const Helpers = require("../helpers/helper.js");

const path = require("path");
const multer = require("multer");

var storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, '');
    }
});
const uploadJob = multer({storage: storage}).array('avatar')

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
        Helpers.apiVersion7()+"customer/profile/complete",
        [authJwt.verifyToken, authJwt.isCustomer],
        completeController.checkCompleteProfile
    );

    app.patch(
        Helpers.apiVersion7()+"customer/profile/update",
        [authJwt.verifyToken, authJwt.isCustomer],
        updateprofileController.ProfileUpdate
    );

    app.get(
        Helpers.apiVersion7() + "customer/profile/rating", 
        [authJwt.verifyToken, authJwt.isCustomer], 
        ratingController.rating
    );
    
    app.post(
        Helpers.apiVersion7() + "customer/profile/picture", 
        [authJwt.verifyToken, authJwt.isCustomer, uploadJob], 
        profilepictureController.uploadProfilePicture
    );

    app.patch(
        Helpers.apiVersion7() + "customer/profile/reuse/picture", 
        [authJwt.verifyToken, authJwt.isCustomer], 
        reusepictureController.ReuseProfilePicture
    );

    app.patch(
        Helpers.apiVersion7() + "customer/profile/remove/picture", 
        [authJwt.verifyToken, authJwt.isCustomer], 
        removepictureController.removeProfilePicture
    );

    app.patch(
        Helpers.apiVersion7() + "customer/logout", 
        [authJwt.verifyToken, authJwt.isCustomer], 
        logoutController.customerLogout
    );

    app.delete(
        Helpers.apiVersion7() + "customer/close/account", 
        [authJwt.verifyToken, authJwt.isCustomer], 
        closeaccountController.customeraccount
    );
};