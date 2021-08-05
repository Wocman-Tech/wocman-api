const { authJwt } = require("../middleware");

const chatController = require("../controllers/users/customer/auth/messaging/chat.controller");
const contactController = require("../controllers/users/customer/auth/messaging/contact.controller");
const customerController = require("../controllers/users/customer/auth/messaging/customer.controller");

const Helpers = require("../helpers/helper.js");

const path = require("path");
const multer = require("multer");

var storageChat = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('', 'app/', 'uploads/customer/picture'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+ path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});

const uploadChat = multer({storageChat}).any('avatar')


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
        Helpers.apiVersion7() + "customer/chat/contacts", 
        [authJwt.verifyToken, authJwt.isCustomer], 
        contactController.wocmanChatContact
    );
    app.post(
        Helpers.apiVersion7() + "customer/chat/contact/details", 
        [authJwt.verifyToken, authJwt.isCustomer], 
        customerController.wocmanContactCustomer
    );
    app.post(
        Helpers.apiVersion7() + "customer/chat/log", 
        [authJwt.verifyToken, authJwt.isCustomer], 
        chatController.chatLog
    );
    app.post(
        Helpers.apiVersion7() + "customer/chat/send",
        [authJwt.verifyToken, authJwt.isCustomer, uploadChat], 
        chatController.chatSave
    );
};