const { authJwt } = require("../middleware");
const { isIdVerify, verifyAdminUser, rootAdmin, rootAction, initiateAdmin } = require("../middleware/admin");

const adminAllWocmanController = require("../controllers/users/admin/auth/wocman/allwocman.controller");
const adminOneWocmanController = require("../controllers/users/admin/auth/wocman/onewocman.controller");
const adminDeleteOneWocmanController = require("../controllers/users/admin/auth/wocman/deletewocman.controller");
const wocmanController = require('../controllers/admin/wocman.controller')


const Helpers = require("../helpers/helper.js");

const path = require("path");
const multer = require("multer");

const  { verifyAdminSignUp } = require("../middleware/website/user/admin");


module.exports = function(app) {
    app.get(
        Helpers.apiVersion7() + "admin/wocman",
        [authJwt.verifyToken, authJwt.isAdmin],
        wocmanController.getAllWocman
    );

    app.get(
        Helpers.apiVersion7() + "admin/wocman/:id",
        [authJwt.verifyToken, authJwt.isAdmin],
        wocmanController.getWocman
    );

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