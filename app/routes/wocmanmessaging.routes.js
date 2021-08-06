const { authJwt } = require("../middleware");

const chatController = require("../controllers/users/wocman/auth/messaging/chat.controller");
const contactController = require("../controllers/users/wocman/auth/messaging/contact.controller");
const customerController = require("../controllers/users/wocman/auth/messaging/customer.controller");

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
    //chat end points
    app.post(
        Helpers.apiVersion7() + "wocman/chat/contacts", 
        [authJwt.verifyToken, authJwt.isWocman], 
        contactController.wocmanChatContact
    );
    app.post(
        Helpers.apiVersion7() + "wocman/chat/contact/details", 
        [authJwt.verifyToken, authJwt.isWocman], 
        customerController.wocmanContactCustomer
    );
    app.post(
        Helpers.apiVersion7() + "wocman/chat/log", 
        [authJwt.verifyToken, authJwt.isWocman], 
        chatController.chatLog
    );
    app.post(
        Helpers.apiVersion7() + "wocman/chat/send",
        [authJwt.verifyToken, authJwt.isWocman, uploadChat], 
        chatController.chatSave
    );
};