const { authJwt } = require("../middleware");

const chatController = require("../controllers/users/wocman/auth/messaging/chat.controller");
const contactController = require("../controllers/users/wocman/auth/messaging/contact.controller");
const customerController = require("../controllers/users/wocman/auth/messaging/customer.controller");

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

    //chat end points

    app.post(
        Helpers.apiVersion7() + "wocman-contacts", 
        [authJwt.verifyToken, authJwt.isWocman], 
        contactController.wocmanChatContact
    );
    app.post(
        Helpers.apiVersion7() + "wocman-contact-customer", 
        [authJwt.verifyToken, authJwt.isWocman], 
        customerController.wocmanContactCustomer
    );
    app.post(
        Helpers.apiVersion7() + "wocman-contact-chatlog", 
        [authJwt.verifyToken, authJwt.isWocman], 
        chatController.chatLog
    );
    app.post(
        Helpers.apiVersion7() + "wocman-contact-chat",
        [authJwt.verifyToken, authJwt.isWocman], 
        chatController.chatSave
    );
};