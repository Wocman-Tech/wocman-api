const { authJwt } = require("../middleware");

const chatController = require("../controllers/users/customer/auth/messaging/chat.controller");
const contactController = require("../controllers/users/customer/auth/messaging/contact.controller");
const customerController = require("../controllers/users/customer/auth/messaging/customer.controller");

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
    app.get(
        Helpers.apiVersion7() + "customer/chat/contacts", 
        [authJwt.verifyToken, authJwt.isCustomer], 
        contactController.wocmanChatContact
    );
    app.get(
        Helpers.apiVersion7() + "customer/chat/contact/details/:wocmanid", 
        [authJwt.verifyToken, authJwt.isCustomer], 
        customerController.wocmanContactCustomer
    );
    app.get(
        Helpers.apiVersion7() + "chat/log", 
        [authJwt.verifyToken], 
        chatController.chatLog
    );
    app.post(
        Helpers.apiVersion7() + "chat/send",
        [authJwt.verifyToken, uploadChat], 
        chatController.chatSave
    );
};