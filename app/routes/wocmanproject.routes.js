const { authJwt } = require("../middleware");

const acceptController = require("../controllers/users/wocman/auth/workstation/accept.controller");
const completeController = require("../controllers/users/wocman/auth/workstation/complete.controller");
const customerController = require("../controllers/users/wocman/auth/workstation/customer.controller");
const projectController = require("../controllers/users/wocman/auth/workstation/project.controller");
const rejectController = require("../controllers/users/wocman/auth/workstation/reject.controller");
const startController = require("../controllers/users/wocman/auth/workstation/start.controller");
const stopController = require("../controllers/users/wocman/auth/workstation/stop.controller");
const chatController = require("../controllers/users/wocman/auth/workstation/chat.controller");


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

    //project routes

    app.post(
        Helpers.apiVersion7() + "wocman-project", 
        [authJwt.verifyToken, authJwt.isWocman], 
        projectController.wocmanProjectProject
    );

    app.post(
        Helpers.apiVersion7() + "wocman-project-customer", 
        [authJwt.verifyToken, authJwt.isWocman], 
        customerController.wocmanProjectCustomer
    );

    app.post(
        Helpers.apiVersion7() + "wocman-project-customer-chat-log", 
        [authJwt.verifyToken, authJwt.isWocman], 
        chatController.chatLog
    );
    app.post(
        Helpers.apiVersion7() + "wocman-project-customer-chat-save", 
        [authJwt.verifyToken, authJwt.isWocman], 
        chatController.chatSave
    );

    app.post(
        Helpers.apiVersion7() + "wocman-accept-project", 
        [authJwt.verifyToken, authJwt.isWocman], 
        acceptController.wocmanAcceptProject
    );
    app.post(
        Helpers.apiVersion7() + "wocman-reject-project", 
        [authJwt.verifyToken, authJwt.isWocman], 
        rejectController.wocmanRejectProject
    );
    app.post(
        Helpers.apiVersion7() + "wocman-start-project", 
        [authJwt.verifyToken, authJwt.isWocman], 
        startController.wocmanStartProject
    );
    app.post(
        Helpers.apiVersion7() + "wocman-stop-project", 
        [authJwt.verifyToken, authJwt.isWocman], 
        stopController.wocmanStopProject
    );
    app.post(
        Helpers.apiVersion7() + "wocman-complete-project", 
        [authJwt.verifyToken, authJwt.isWocman], 
        completeController.wocmanCompleteProject
    );
};