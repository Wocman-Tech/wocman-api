const { authJwt } = require("../middleware");

const featuredWocman = require("../controllers/users/customer/auth/dashboard/featuredwocman.controller");
const customerNav = require("../controllers/users/customer/auth/nav/details.controller");
const jobControllers = require("../controllers/users/customer/auth/job/job.controller")


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
    app.get(
        Helpers.apiVersion7()+"customer/nav",
        [authJwt.verifyToken, authJwt.isCustomer],
        customerNav.customerNav
    );

    app.get(
        Helpers.apiVersion7()+"customer/jobs",
        [authJwt.verifyToken, authJwt.isCustomer],
        jobControllers.customerJobs
    );

    app.get(
        Helpers.apiVersion7()+"customer/job/projects",
        [authJwt.verifyToken],
        jobControllers.jobCategory
    );

    app.post(
        Helpers.apiVersion7()+"customer/job/upload-project",
        authJwt.verifyToken, authJwt.isCustomer, uploadJob,
        featuredWocman.uploadProject
    );
};