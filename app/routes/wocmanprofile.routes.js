const { authJwt } = require("../middleware");

const addcertificateController = require("../controllers/users/wocman/auth/profile/addcertificate.controller");
const completeController = require("../controllers/users/wocman/auth/profile/complete.controller");
const logoutController = require("../controllers/users/wocman/auth/profile/logout.controller");
const profileController = require("../controllers/users/wocman/auth/profile/profile.controller");
const removecertificateController = require("../controllers/users/wocman/auth/profile/removecertificate.controller");
const reusepictureController = require("../controllers/users/wocman/auth/profile/reusepicture.controller");
const removepictureController = require("../controllers/users/wocman/auth/profile/removepicture.controller");
const updateprofileController = require("../controllers/users/wocman/auth/profile/updateprofile.controller");
const profilepictureController = require("../controllers/users/wocman/auth/profile/profilepicture.controller");
const closeaccountController = require("../controllers/users/wocman/auth/profile/closeaccount.controller");
const ratingController = require("../controllers/users/wocman/auth/profile/rating.controller");
const addskillController = require("../controllers/users/wocman/auth/profile/addskill.controller");
const removeskillController = require("../controllers/users/wocman/auth/profile/removeskill.controller");
const categoryController = require("../controllers/users/wocman/auth/profile/category.controller");
const competenceController = require("../controllers/users/wocman/auth/profile/competency.controller");

const Helpers = require("../helpers/helper.js");

const path = require("path");
const multer = require("multer");

var storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, '');
    }
});

const uploadPicture = multer({storage: storage}).single('avatar')
const uploadCertificate = multer({storage: storage}).single('avatar')


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
        Helpers.apiVersion7()+"wocman/profile",
        [authJwt.verifyToken, authJwt.isWocman],
        profileController.wocmanProfile
    );
    app.post(
        Helpers.apiVersion7()+"wocman/profile/complete",
        [authJwt.verifyToken, authJwt.isWocman],
        completeController.checkCompleteProfileWocman
    );
    app.post(
        Helpers.apiVersion7()+"wocman/profile/update",
        [authJwt.verifyToken, authJwt.isWocman],
        updateprofileController.wocmanProfileUpdate
    );

    //certificate
    app.post(
        Helpers.apiVersion7() + "wocman/profile/add/certificate", 
        [authJwt.verifyToken, authJwt.isWocman, uploadCertificate ], 
        addcertificateController.wocmanAddCertificate
    );
    app.post(
        Helpers.apiVersion7() + "wocman/profile/remove/certificate", 
        [authJwt.verifyToken, authJwt.isWocman], 
        removecertificateController.wocmanRemoveCertificate
    );

    //Skills
    app.post(
        Helpers.apiVersion7() + "wocman/profile/add/competency", 
        [authJwt.verifyToken, authJwt.isWocman ], 
        competenceController.wocmanAddCompetence
    );

    app.post(
        Helpers.apiVersion7() + "wocman/profile/get/competency", 
        [authJwt.verifyToken, authJwt.isWocman ], 
        competenceController.wocmanListCompetencies
    );

    app.post(
        Helpers.apiVersion7() + "wocman/profile/add/category", 
        [authJwt.verifyToken, authJwt.isWocman ], 
        categoryController.wocmanAddCategory
    );

    app.post(
        Helpers.apiVersion7() + "wocman/profile/get/category", 
        [authJwt.verifyToken, authJwt.isWocman ], 
        categoryController.wocmanListCategories
    );

    app.post(
        Helpers.apiVersion7() + "wocman/profile/add/skill", 
        [authJwt.verifyToken, authJwt.isWocman ], 
        addskillController.wocmanAddSkill
    );
    
    app.post(
        Helpers.apiVersion7() + "wocman/profile/remove/skill", 
        [authJwt.verifyToken, authJwt.isWocman], 
        removeskillController.wocmanRemoveSkill
    );

    app.post(
        Helpers.apiVersion7() + "wocman/profile/skill", 
        [authJwt.verifyToken, authJwt.isWocman], 
        addskillController.wocmanListSkills
    );
    

    app.post(
        Helpers.apiVersion7() + "wocman/profile/rating", 
        [authJwt.verifyToken, authJwt.isWocman], 
        ratingController.rating
    );
    
    app.post(
        Helpers.apiVersion7() + "wocman/profile/picture", 
        [authJwt.verifyToken, authJwt.isWocman, uploadPicture], 
        profilepictureController.uploadProfilePictureWocman
    );

    app.post(
        Helpers.apiVersion7() + "wocman/profile/reuse/picture", 
        [authJwt.verifyToken, authJwt.isWocman], 
        reusepictureController.wocmanReuseProfilePicture
    );

    app.post(
        Helpers.apiVersion7() + "wocman/profile/remove/picture", 
        [authJwt.verifyToken, authJwt.isWocman], 
        removepictureController.removeProfilePicture
    );

    app.post(
        Helpers.apiVersion7() + "wocman/logout", 
        [authJwt.verifyToken, authJwt.isWocman], 
        logoutController.wocmanLogout
    );
    app.post(
        Helpers.apiVersion7() + "wocman/close/account", 
        [authJwt.verifyToken, authJwt.isWocman], 
        closeaccountController.wocmanaccount
    );
};