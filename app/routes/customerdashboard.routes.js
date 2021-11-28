const { authJwt } = require("../middleware");

const featuredWocman = require("../controllers/users/customer/auth/dashboard/featuredwocman.controller");
const customerNav = require("../controllers/users/customer/auth/nav/details.controller");


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

    app.post(
        Helpers.apiVersion7()+"customer/nav",
        [authJwt.verifyToken, authJwt.isCustomer],
        customerNav.customerNav
    );

    app.post(
        Helpers.apiVersion7()+"customer/job/projects",
        [authJwt.verifyToken, authJwt.isCustomer],
        featuredWocman.projectTypes
    );

    app.post(
        Helpers.apiVersion7()+"customer/job/upload-project",
        [authJwt.verifyToken, authJwt.isCustomer, uploadJob],
        featuredWocman.uploadProject
    );
};