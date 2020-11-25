const { verifySignUp } = require("../middleware");


const authController = require("../controllers/auth.controller");

const Helpers = require("../helpers/helper.js");
const { authJwt } = require("../middleware");
const path = require("path");

const multer = require("multer");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('', 'app/', 'uploads/wocman/picture'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+ path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});
var upload = multer({ 
    storage: storage, 
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

    app.post(
        Helpers.apiVersion7()+"auth/wocman-signin",
        [
            verifySignUp.checkRolesExisted
        ],
        authController.signInWocman
    );

    app.post(Helpers.apiVersion7() + "auth/wocman-signup", authController.signUpWocman);

    app.post(Helpers.apiVersion7() + "auth/wocman-profile-picture", [authJwt.verifyToken, authJwt.isWocman, upload.single('avatar')], authController.uploadProfilePictureWocman);
};