const { authJwt } = require("../middleware");
const { isIdVerify, verifyAdminUser, rootAdmin, rootAction, initiateAdmin } = require("../middleware/admin");

const adminAccountsController = require("../controllers/users/admin/auth/accounts/accounts.controller");


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
        Helpers.apiVersion7() + "admin/accounts", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminAccountsController.accounts
    );

    app.post(
        Helpers.apiVersion7() + "admin/accounts/filter", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminAccountsController.accounts_filter
    );

    app.post(
        Helpers.apiVersion7() + "admin/accounts/open", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminAccountsController.accounts_open
    );

    app.post(
        Helpers.apiVersion7() + "admin/accounts/open/filter", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminAccountsController.accounts_openfilter
    );

    app.post(
        Helpers.apiVersion7() + "admin/accounts/close", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction],
        adminAccountsController.accounts_close
    );
};