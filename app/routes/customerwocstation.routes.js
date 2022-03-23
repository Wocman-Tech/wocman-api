const { authJwt } = require("../middleware");

const activitiesController = require("../controllers/users/customer/auth/workstation/activities.controller");
const scheduleController = require("../controllers/users/customer/auth/workstation/schedule.controller");
const wocstationController = require("../controllers/users/customer/auth/workstation/wocstation.controller");


const Helpers = require("../helpers/helper.js");

const path = require("path");
const multer = require("multer");

var storageCert = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('', 'app/', 'uploads/wocman/certificate'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+ path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});
var uploadCert = multer({ 
    storage: storageCert, 
    fileFilter : (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif") {
            cb(null, true);
        }else{
            cb(null, false);
            return cb(new Error('Only jpeg, jpg, png, gif file extensions are allowerd'));
        }
    }
});

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    //wocstation routes

    app.get(
        Helpers.apiVersion7() + "customer/wocstation", 
        [authJwt.verifyToken, authJwt.isCustomer], 
        wocstationController.wocstation_details
    );
    app.post(
        Helpers.apiVersion7() + "customer/wocstation/schedule", 
        [authJwt.verifyToken, authJwt.isCustomer], 
        scheduleController.book_appointment
    );

    app.put(
        Helpers.apiVersion7() + "customer/wocstation/activities/start_project/:projectid", 
        [authJwt.verifyToken, authJwt.isCustomer], 
        activitiesController.startProject
    );

    app.put(
        Helpers.apiVersion7() + "customer/wocstation/activities/complete_project/:projectid", 
        [authJwt.verifyToken, authJwt.isCustomer], 
        activitiesController.completeProject
    );

    app.put(
        Helpers.apiVersion7() + "customer/wocstation/activities/rate_project", 
        [authJwt.verifyToken, authJwt.isCustomer], 
        activitiesController.rateProject
    );

    app.put(
        Helpers.apiVersion7() + "customer/wocstation/activities/report_project", 
        [authJwt.verifyToken, authJwt.isCustomer], 
        activitiesController.reportProject
    );
};