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

var storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, '');
    }
});
const uploadChat = multer({storage: storage}).array('avatar')

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    //project routes

    app.get(
        Helpers.apiVersion7() + "wocman/project/:projectid", 
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
        [authJwt.verifyToken, authJwt.isWocman, uploadChat], 
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