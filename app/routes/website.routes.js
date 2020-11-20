const { authJwt } = require("../middleware");

const authController = require("../controllers/auth.controller");

const wocmanAuthUserController = require("../controllers/users/wocman/auth/user.controller");
const wocmanAuthProjectController = require("../controllers/users/wocman/auth/project.controller");
const wocmanAuthChatController = require("../controllers/users/wocman/auth/chat.controller");

const wocmanUserController = require("../controllers/users/wocman/wocman.controller");

const websiteController = require("../controllers/website/website.controller");


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

    //website endpoints
    app.get(
        Helpers.apiVersion7() + "get-location/:location", 
        [], 
        websiteController.locationData
    );

    app.get(
        Helpers.apiVersion7() + "get-news-letters-subscribers", 
        [], 
        websiteController.newsletter
    );

    app.post(
        Helpers.apiVersion7() + "subscribe-news-letters", 
        [], 
        websiteController.subscribenewsletter
    );

    app.post(
        Helpers.apiVersion7() + "contact-us",
        [], 
        websiteController.contactus
    );
};