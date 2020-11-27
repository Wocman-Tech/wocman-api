const { verifySignUp } = require("../middleware");

const { contactUs, search, addNewsLetter } = require("../middleware/website");
const { verifyWocmanSignUp, verifyWocmanSignIn, verifySignUpLink, verifySendPasswordEmail , verifyChangePasswordEmail , verifyResetIn } = require("../middleware/website/user/wocman");

const confirmpasswordresetController = require("../controllers/website/user/wocman/confirmpasswordresetemail.controller");
const emailverifyController = require("../controllers/website/user/wocman/emailverify.controller");
const resetpasswordController = require("../controllers/website/user/wocman/resetpassword.controller");
const sendchangepasswordController = require("../controllers/website/user/wocman/sendchangepasswordemail.controller");
const signinController = require("../controllers/website/user/wocman/signin.controller");
const adminSigninController = require("../controllers/website/user/admin/signin.controller");
const signupController = require("../controllers/website/user/wocman/signup.controller");

const addnewsletterController = require("../controllers/website/addnewsletter.controller");
const contactController = require("../controllers/website/contact.controller");
const searchController = require("../controllers/website/search.controller");

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

    app.get(
        Helpers.apiVersion7() + "get-location/:location", 
        [search.isSearchVerify], 
        searchController.locationData
    );

    app.post(
        Helpers.apiVersion7() + "subscribe-news-letters", 
        [addNewsLetter.isEmailVerify], 
        addnewsletterController.subscribenewsletter
    );

    app.post(
        Helpers.apiVersion7() + "contact-us",
        [contactUs.isEmailVerify, contactUs.isNameVerify, contactUs.isInquiryVerify, contactUs.isPhoneVerify, contactUs.isMessageVerify], 
        contactController.contactus
    );


    app.get(
        Helpers.apiVersion7()+"wocman-signup-verification/:link",
        [verifySignUpLink.isLinkVerify],
        emailverifyController.checkVerifyEmailLinkWocman
    );

    app.post(
        Helpers.apiVersion7()+"password-reset-wocman",
        [verifySendPasswordEmail.isEmailVerify],
        sendchangepasswordController.wocmanResetPassword
    );

    app.get(
        Helpers.apiVersion7()+"wocman-password-reset/:link",
        [verifyChangePasswordEmail.isLinkVerify],
        confirmpasswordresetController.wocmanResetPasswordConfirm
    );

    app.post(
        Helpers.apiVersion7()+"wocman-password-reset",
        [verifyResetIn.isEmailVerify, verifyResetIn.isPasswordVerify],
        resetpasswordController.wocmanStartResetPassword
    );

    app.post(
        Helpers.apiVersion7() + "auth/wocman-signup",
        [
            verifyWocmanSignUp.isEmailVerify, 
            verifyWocmanSignUp.isPasswordVerify, 
            verifyWocmanSignUp.isPasswordConfirmed,
            verifyWocmanSignUp.isUsernameVerify, 
            verifyWocmanSignUp.checkDuplicateUsernameOrEmail
        ],
        signupController.signUpWocman
    );

    app.post(
        Helpers.apiVersion7()+"auth/wocman-signin",
        [
            verifyWocmanSignIn.isEmailVerify, verifyWocmanSignIn.isPasswordVerify, verifyWocmanSignIn.checkRole
        ],
        signinController.signInWocman
    );

    app.post(
        Helpers.apiVersion7()+"auth/admin-signin",
        [
            
        ],
        adminSigninController.signInWocman
    );
};