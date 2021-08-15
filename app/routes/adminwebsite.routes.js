const { authJwt } = require("../middleware");
const { isIdVerify, verifyAdminUser, rootAdmin, rootAction, initiateAdmin } = require("../middleware/admin");

const newsletterController = require("../controllers/users/admin/auth/website/newslettersubscribers.controller");
const contactController = require("../controllers/users/admin/auth/website/contactus.controller");

const Helpers = require("../helpers/helper.js");

const path = require("path");
const multer = require("multer");

const  { verifyAdminSignUp } = require("../middleware/website/user/admin");


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
    app.get(
        Helpers.apiVersion7() + "admin/website/get/all/newsletterssubscribers", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction], 
        newsletterController.AllNewsletter
    );

    app.get(
        Helpers.apiVersion7() + "admin/website/get/newsletterssubscriber/:id", 
        [authJwt.verifyToken, authJwt.isAdmin, isIdVerify.isIdVerify, rootAction.isRootAction], 
        newsletterController.oneNewsletter
    );

    app.get(
        Helpers.apiVersion7() + "admin/website/delete/newsletterssubscriber/:id", 
        [authJwt.verifyToken, authJwt.isAdmin, isIdVerify.isIdVerify, rootAction.isRootAction], 
        newsletterController.deleteNewsletter
    );

    app.get(
        Helpers.apiVersion7() + "admin/website/get/all/contactus", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction], 
        contactController.allContacts
    );

    app.get(
        Helpers.apiVersion7() + "admin/website/get/conntactus/:id", 
        [authJwt.verifyToken, authJwt.isAdmin, isIdVerify.isIdVerify, rootAction.isRootAction], 
        contactController.oneContact
    );

    app.get(
        Helpers.apiVersion7() + "admin/website/delete/contactus/:id", 
        [authJwt.verifyToken, authJwt.isAdmin, isIdVerify.isIdVerify, rootAction.isRootAction], 
        contactController.deleteContact
    );

    app.post(
        Helpers.apiVersion7() + "admin/website/replay/chat", 
        [authJwt.verifyToken, authJwt.isAdmin,  rootAction.isRootAction, uploadJob], 
        contactController.replayContact
    );

    app.post(
        Helpers.apiVersion7() + "admin/website/send/newsletter", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction, uploadJob], 
        newsletterController.sendNewsletter
    );

};