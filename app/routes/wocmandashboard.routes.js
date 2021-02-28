const { authJwt } = require("../middleware");

const walletDetails = require("../controllers/users/wocman/auth/dashboard/walletdetails.controller");
const workDone = require("../controllers/users/wocman/auth/dashboard/workdone.controller");
const rating = require("../controllers/users/wocman/auth/dashboard/rating.controller");
const completion = require("../controllers/users/wocman/auth/dashboard/completion.controller");
const notice = require("../controllers/users/wocman/auth/dashboard/notice.controller");
const schedule = require("../controllers/users/wocman/auth/dashboard/schedule.controller");

const Helpers = require("../helpers/helper.js");

const path = require("path");
const multer = require("multer");


module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        Helpers.apiVersion7()+"dashboard-wallet-details",
        [authJwt.verifyToken, authJwt.isWocman],
        walletDetails.walletDetails
    );
    app.post(
        Helpers.apiVersion7()+"dashboard-workdone-details",
        [authJwt.verifyToken, authJwt.isWocman],
        workDone.workDone
    );
    app.post(
        Helpers.apiVersion7()+"dashboard-ratings",
        [authJwt.verifyToken, authJwt.isWocman],
        rating.rating
    );
    app.post(
        Helpers.apiVersion7()+"dashboard-completed",
        [authJwt.verifyToken, authJwt.isWocman],
        completion.completedProjects
    );
    app.post(
        Helpers.apiVersion7()+"dashboard-notice",
        [authJwt.verifyToken, authJwt.isWocman],
        notice.notice
    );
    app.post(
        Helpers.apiVersion7()+"dashboard-schedule",
        [authJwt.verifyToken, authJwt.isWocman],
        schedule.schedule
    );
};