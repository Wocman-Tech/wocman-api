const { authJwt } = require("../middleware");
const { isIdVerify, verifyAdminUser, rootAdmin, rootAction, initiateAdmin } = require("../middleware/admin");


const adminNavAndUserController = require("../controllers/users/admin/auth/dashboard/navanduser.controller");
const adminAccountAndProjectController = require("../controllers/users/admin/auth/dashboard/accountandproject.controller");

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
        Helpers.apiVersion7() + "admin/nav", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminNavAndUserController.nav
    );

    app.post(
        Helpers.apiVersion7() + "admin/dashboard/total/admins", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminNavAndUserController.admins
    );

    app.post(
        Helpers.apiVersion7() + "admin/dashboard/total/wocmen", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminNavAndUserController.wocmen
    );

    app.post(
        Helpers.apiVersion7() + "admin/dashboard/total/customers", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminNavAndUserController.customers
    );

    app.post(
        Helpers.apiVersion7() + "admin/dashboard/total/income", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminAccountAndProjectController.received
    );

    app.post(
        Helpers.apiVersion7() + "admin/dashboard/total/expenses", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminAccountAndProjectController.spent
    );

    app.post(
        Helpers.apiVersion7() + "admin/dashboard/total/projects", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminAccountAndProjectController.projects
    );
};
