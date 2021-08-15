const { authJwt } = require("../middleware");
const { isIdVerify, verifyAdminUser, rootAdmin, rootAction, initiateAdmin } = require("../middleware/admin");

const adminOneController = require("../controllers/users/admin/auth/projects/one.controller");
const adminTwoController = require("../controllers/users/admin/auth/projects/two.controller");
const adminThreeController = require("../controllers/users/admin/auth/projects/three.controller");


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
        Helpers.apiVersion7() + "admin/projects", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminOneController.projects
    );

    app.post(
        Helpers.apiVersion7() + "admin/projects/filter", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminOneController.projects_filter
    );

    app.post(
        Helpers.apiVersion7() + "admin/projects/completed", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminOneController.projects_complete
    );

    app.post(
        Helpers.apiVersion7() + "admin/projects/completed/filter", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminTwoController.projects_complete_filter
    );

    app.post(
        Helpers.apiVersion7() + "admin/projects/has/quotation", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminTwoController.projects_quotation
    );

    app.post(
        Helpers.apiVersion7() + "admin/projects/no/quotation", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminTwoController.projects_no_quotation
    );

    app.post(
        Helpers.apiVersion7() + "admin/projects/has/schedule", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminTwoController.projects_schedule
    );

    app.post(
        Helpers.apiVersion7() + "admin/projects/no/schedule", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminThreeController.projects_no_schedule
    );

    app.post(
        Helpers.apiVersion7() + "admin/projects/has/wocman", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminThreeController.projects_wocman
    );

    app.post(
        Helpers.apiVersion7() + "admin/projects/no/wocman", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminThreeController.projects_no_wocman
    );

    app.post(
        Helpers.apiVersion7() + "admin/project/delete", 
        [authJwt.verifyToken, authJwt.isAdmin, rootAdmin.isRootAdmin, rootAction.isRootAction],
        adminThreeController.delete_project
    );
};