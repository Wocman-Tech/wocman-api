const { authJwt } = require("../middleware");
const { isIdVerify, verifyAdminUser, rootAdmin, rootAction, initiateAdmin } = require("../middleware/admin");

const adminAllAdminController = require("../controllers/users/admin/auth/admin/alladmin.controller");
const adminOneAdminController = require("../controllers/users/admin/auth/admin/oneadmin.controller");

const adminSignupController = require("../controllers/users/admin/auth/admin/signup.controller");
const adminRootController = require("../controllers/users/admin/auth/admin/rootadmin.controller");

const adminRootCloseController = require("../controllers/users/admin/auth/admin/closeaccount.controller");

const Helpers = require("../helpers/helper.js");

const path = require("path");
const multer = require("multer");

const  { verifyAdminSignUp } = require("../middleware/website/user/admin");


module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        Helpers.apiVersion7() + "auth/admin/signup",
        [
            authJwt.verifyToken,
            authJwt.isAdmin,
            rootAdmin.isRootAdmin,
            rootAction.isRootAction,
            verifyAdminSignUp.isEmailVerify, 
            verifyAdminSignUp.isPasswordVerify, 
            verifyAdminSignUp.isPasswordConfirmed,
            verifyAdminSignUp.checkDuplicateUsernameOrEmail
        ],
        adminSignupController.signUpAdmin
    );

    app.get(
        Helpers.apiVersion7() + "admin/admins",
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminAllAdminController.allAdmin
    );

    app.get(
        Helpers.apiVersion7() + "admin/details/:id", 
        [authJwt.verifyToken, authJwt.isAdmin, isIdVerify.isIdVerify, rootAction.isRootAction],
        adminOneAdminController.oneAdmin
    );

    app.post(
        Helpers.apiVersion7() + "admin/delete",
        [
            authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction
        ],
        adminRootCloseController.adminclose
    );

    app.post(
        Helpers.apiVersion7() + "admin/root/enable/login", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction, verifyAdminSignUp.isEmailVerify],
        adminRootController.islogin
    );

    app.post(
        Helpers.apiVersion7() + "admin/root/disable/login", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction, verifyAdminSignUp.isEmailVerify],
        adminRootController.cancel_islogin
    );

    app.post(
        Helpers.apiVersion7() + "admin/root/enable/profile", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction, verifyAdminSignUp.isEmailVerify],
        adminRootController.isprofile
    );

    app.post(
        Helpers.apiVersion7() + "admin/root/disable/profile", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction, verifyAdminSignUp.isEmailVerify],
        adminRootController.cancel_isprofile
    );

    app.post(
        Helpers.apiVersion7() + "admin/root/enable/settings", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction,verifyAdminSignUp.isEmailVerify],
        adminRootController.issettings
    );

    app.post(
        Helpers.apiVersion7() + "admin/root/disable/settings", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction, verifyAdminSignUp.isEmailVerify],
        adminRootController.cancel_issettings
    );

    app.post(
        Helpers.apiVersion7() + "admin/root/enable/customer", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction, verifyAdminSignUp.isEmailVerify],
        adminRootController.iscustomer
    );

    app.post(
        Helpers.apiVersion7() + "admin/root/disable/customer", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction, verifyAdminSignUp.isEmailVerify],
        adminRootController.cancel_iscustomer
    );

    app.post(
        Helpers.apiVersion7() + "admin/root/enable/wocman", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction, verifyAdminSignUp.isEmailVerify],
        adminRootController.iswocman
    );

    app.post(
        Helpers.apiVersion7() + "admin/root/disable/wocman", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction, verifyAdminSignUp.isEmailVerify],
        adminRootController.cancel_iswocman
    );

    app.post(
        Helpers.apiVersion7() + "admin/root/enable/project", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction, verifyAdminSignUp.isEmailVerify],
        adminRootController.isproject
    );

    app.post(
        Helpers.apiVersion7() + "admin/root/disable/project", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction, verifyAdminSignUp.isEmailVerify],
        adminRootController.cancel_isproject
    );

    app.post(
        Helpers.apiVersion7() + "admin/root/enable/user", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction, verifyAdminSignUp.isEmailVerify],
        adminRootController.isuser
    );

    app.post(
        Helpers.apiVersion7() + "admin/root/disable/user", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction, verifyAdminSignUp.isEmailVerify],
        adminRootController.cancel_isuser
    );

    app.post(
        Helpers.apiVersion7() + "admin/root/enable/account", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction, verifyAdminSignUp.isEmailVerify],
        adminRootController.isaccount
    );

    app.post(
        Helpers.apiVersion7() + "admin/root/disable/account", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction, verifyAdminSignUp.isEmailVerify],
        adminRootController.cancel_isaccount
    );
};