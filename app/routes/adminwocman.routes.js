const { authJwt } = require("../middleware");
const { isIdVerify, verifyAdminUser, rootAdmin, rootAction, initiateAdmin } = require("../middleware/admin");

const adminAllWocmanController = require("../controllers/users/admin/auth/wocman/allwocman.controller");
const adminOneWocmanController = require("../controllers/users/admin/auth/wocman/onewocman.controller");
const adminDeleteOneWocmanController = require("../controllers/users/admin/auth/wocman/deletewocman.controller");


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

    app.get(
        Helpers.apiVersion7() + "get-all-wocman",
        [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
        adminAllWocmanController.allWocman
    );

    app.get(
        Helpers.apiVersion7() + "get-one-wocman/:id",
        [authJwt.verifyToken, authJwt.isAdmin, isIdVerify.isIdVerify, rootAction.isRootAction],
        adminOneWocmanController.oneWocman
    );

    app.get(
        Helpers.apiVersion7() + "delete-one-wocman/:id",
        [authJwt.verifyToken, authJwt.isAdmin, isIdVerify.isIdVerify, rootAction.isRootAction],
        adminDeleteOneWocmanController.deleteWocman
    );
};