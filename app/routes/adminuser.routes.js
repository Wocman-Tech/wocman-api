const { authJwt } = require("../middleware");
const { isIdVerify } = require("../middleware/admin");

const newsletterController = require("../controllers/users/admin/auth/newslettersubscribers.controller");
const contactController = require("../controllers/users/admin/auth/contactus.controller");

const adminAllAdminController = require("../controllers/users/admin/auth/admin/alladmin.controller");
const adminOneAdminController = require("../controllers/users/admin/auth/admin/oneadmin.controller");
const adminDeleteOneAdminController = require("../controllers/users/admin/auth/admin/deleteadmin.controller");

const adminAllWocmanController = require("../controllers/users/admin/auth/wocman/allwocman.controller");
const adminOneWocmanController = require("../controllers/users/admin/auth/wocman/onewocman.controller");
const adminDeleteOneWocmanController = require("../controllers/users/admin/auth/wocman/deletewocman.controller");

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

var storageProfile = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('', 'app/', 'uploads/wocman/picture'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+ path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});
var uploadPicture = multer({ 
    storage: storageProfile, 
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
    app.get(
        Helpers.apiVersion7() + "get-all-newsletterssubscribers", 
        [authJwt.verifyToken, authJwt.isAdmin], 
        newsletterController.AllNewsletter
    );

    app.get(
        Helpers.apiVersion7() + "get-one-newsletterssubscribers/:id", 
        [authJwt.verifyToken, authJwt.isAdmin, isIdVerify.isIdVerify], 
        newsletterController.oneNewsletter
    );

    app.get(
        Helpers.apiVersion7() + "delete-one-newsletterssubscribers/:id", 
        [authJwt.verifyToken, authJwt.isAdmin, isIdVerify.isIdVerify], 
        newsletterController.deleteNewsletter
    );

    app.get(
        Helpers.apiVersion7() + "get-all-contactus", 
        [authJwt.verifyToken, authJwt.isAdmin], 
        contactController.allContacts
    );

    app.get(
        Helpers.apiVersion7() + "get-one-contactus/:id", 
        [authJwt.verifyToken, authJwt.isAdmin, isIdVerify.isIdVerify], 
        contactController.oneContact
    );

    app.get(
        Helpers.apiVersion7() + "delete-one-contactus/:id", 
        [authJwt.verifyToken, authJwt.isAdmin, isIdVerify.isIdVerify], 
        contactController.deleteContact
    );

    app.get(
        Helpers.apiVersion7() + "get-all-wocman",
        [authJwt.verifyToken, authJwt.isAdmin],
        adminAllWocmanController.allWocman
    );

    app.get(
        Helpers.apiVersion7() + "get-one-wocman/:id",
        [authJwt.verifyToken, authJwt.isAdmin, isIdVerify.isIdVerify],
        adminOneWocmanController.oneWocman
    );

    app.get(
        Helpers.apiVersion7() + "delete-one-wocman/:id",
        [authJwt.verifyToken, authJwt.isAdmin, isIdVerify.isIdVerify],
        adminDeleteOneWocmanController.deleteWocman
    );

    app.get(
        Helpers.apiVersion7() + "get-all-admin",
        [authJwt.verifyToken, authJwt.isAdmin],
        adminAllAdminController.allAdmin
    );

    app.get(
        Helpers.apiVersion7() + "get-one-admin/:id", 
        [authJwt.verifyToken, authJwt.isAdmin, isIdVerify.isIdVerify],
        adminOneAdminController.oneAdmin
    );

    app.get(
        Helpers.apiVersion7() + "delete-one-admin/:id", 
        [authJwt.verifyToken, authJwt.isAdmin, isIdVerify.isIdVerify],
        adminDeleteOneAdminController.deleteAdmin
    );
};