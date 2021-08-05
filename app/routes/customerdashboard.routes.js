const { authJwt } = require("../middleware");

const featuredWocman = require("../controllers/users/customer/auth/dashboard/featuredwocman.controller");
const customerNav = require("../controllers/users/customer/auth/nav/details.controller");


const Helpers = require("../helpers/helper.js");

const path = require("path");
const multer = require("multer");


var storageJob = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('', 'app/', 'uploads/customer/picture'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+ path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});
const uploadJob = multer({storageJob}).any('avatar')

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        Helpers.apiVersion7()+"customer/job/featured-wocman",
        [authJwt.verifyToken, authJwt.isCustomer],
        featuredWocman.wocmanDetails
    );

    app.post(
        Helpers.apiVersion7()+"customer/nav",
        [authJwt.verifyToken, authJwt.isCustomer],
        customerNav.customerNav
    );

    app.post(
        Helpers.apiVersion7()+"customer/job/project-types",
        [authJwt.verifyToken, authJwt.isCustomer],
        featuredWocman.projectTypes
    );

    app.post(
        Helpers.apiVersion7()+"customer/job/upload-project",
        [authJwt.verifyToken, authJwt.isCustomer, uploadJob],
        featuredWocman.uploadProject
    );

    app.post(
        Helpers.apiVersion7()+"customer/job/list-project",
        [authJwt.verifyToken, authJwt.isCustomer],
        featuredWocman.listProject
    );
};