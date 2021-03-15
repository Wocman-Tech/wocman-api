const { verifySignUp } = require("../middleware");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');
require("../config/passportgoogle.config.js");

const { resolve, port, website }  = require("../config/auth.config");


const { contactUs, search, addNewsLetter } = require("../middleware/website");
const 
    {   
        verifyWocmanSignUp, 
        verifyWocmanSignIn, 
        verifySignUpLink, 
        verifySendPasswordEmail, 
        verifyChangePasswordEmail, 
        verifyResetIn,
        verifyDevice,
        verify2FA 
    } = require("../middleware/website/user/wocman");

const 
    {   
        verifyAdminSignUp, 
        verifyAdminSignIn, 
        verifyAdminSignUpLink, 
        verifyAdminSendPasswordEmail, 
        verifyAdminChangePasswordEmail, 
        verifyAdminResetIn 
    } = require("../middleware/website/user/admin");



const isDeviceVC = require("../controllers/website/user/wocman/isDevice.controller");
const confirmpasswordresetController = require("../controllers/website/user/wocman/confirmpasswordresetemail.controller");
const emailverifyController = require("../controllers/website/user/wocman/emailverify.controller");
const resetpasswordController = require("../controllers/website/user/wocman/resetpassword.controller");
const sendchangepasswordController = require("../controllers/website/user/wocman/sendchangepasswordemail.controller");
const signinController = require("../controllers/website/user/wocman/signin.controller");
const signinPassportGoogleController = require("../controllers/website/user/wocman/passportgoogleauth.controller");
const signupController = require("../controllers/website/user/wocman/signup.controller");


const adminconfirmpasswordresetController = require("../controllers/website/user/admin/confirmpasswordresetemail.controller");
const adminemailverifyController = require("../controllers/website/user/admin/emailverify.controller");
const adminresetpasswordController = require("../controllers/website/user/admin/resetpassword.controller");
const adminsendchangepasswordController = require("../controllers/website/user/admin/sendchangepasswordemail.controller");
const adminsignupController = require("../controllers/website/user/admin/signup.controller");
const adminSigninController = require("../controllers/website/user/admin/signin.controller");

const newsletterController = require("../controllers/website/addnewsletter.controller");
const contactController = require("../controllers/website/contact.controller");
const searchController = require("../controllers/website/search.controller");

const Helpers = require("../helpers/helper.js");
const { EMAIL, PASSWORD, MAIN_URL } = require("../helpers/helper.js");

// const failUrl =  Helpers.apiVersion7()+"google-auth/wocman-signin-failed"
const failUrl = website + '/wocman?token=null';

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
    //Website Endpoints
    app.get(
        Helpers.apiVersion7() + "get-location/:location", 
        [search.isSearchVerify], 
        searchController.locationData
    );

    app.post(
        Helpers.apiVersion7() + "subscribe-news-letters",
        [addNewsLetter.isEmailVerify],
        newsletterController.subscribenewsletter
    );

    app.post(
        Helpers.apiVersion7() + "contact-us",
        [
            contactUs.isEmailVerify, 
            contactUs.isNameVerify, 
            contactUs.isInquiryVerify, 
            contactUs.isPhoneVerify, 
            contactUs.isMessageVerify
        ], 
        contactController.contactus
    );

    //wocman Website Endpoints


    //a wocman user wants to register,
    //they would hit this endpoint once they submit their data(email, username and password) for registration.
    //this sends an email to them with a registration verification link

    app.post(
        Helpers.apiVersion7() + "auth/wocman-signup",
        [
            verifyWocmanSignUp.isEmailVerify, 
            verifyWocmanSignUp.isPasswordVerify, 
            verifyWocmanSignUp.isPasswordConfirmed,
            verifyWocmanSignUp.checkDuplicateUsernameOrEmail
        ],
        signupController.signUpWocman
    );

    //a wocman user signs up, an email is sent to him/her, once they click on the link in the email,
    //they would hit this endpoint which returns an access token(prove of temporary login)
    //then they should be sent to profile completion page if access token returned is not null
    //the profile completion endpiont(complete-profile-wocman) is in the wocmanuser.routes.js routes 
    //var email_link =  req.params.link;

    app.post(
        Helpers.apiVersion7()+"wocman-signup-resend-verification",
        [verifyWocmanSignUp.isEmailVerify],
        emailverifyController.resendEmail
    );

    app.get(
        Helpers.apiVersion7()+"wocman-signup-verification/:link",
        [verifySignUpLink.isLinkVerify],
        emailverifyController.checkVerifyEmailLinkWocman
    );

    //a wocman user signs up, wants to login,
    //they would hit this endpoint once to submit login form which returns an access token(prove of temporary login)
    //then they should be sent to dashboard page if access token returned is not null
    //immediatelly they are sent to dashboard, you call the dashboard endpoint to retrieve all the wocman data(very complex array of profile info, wallet info, job info and settings info)
    //the dashboard endpoint(profile-wocman) is in the wocmanuser.routes.js routes 
    app.post(
        Helpers.apiVersion7()+"auth/wocman-signin",
        [
            verifyWocmanSignIn.isEmailVerify, 
            verifyWocmanSignIn.isPasswordVerify, 
            verifyWocmanSignIn.checkRole,
            verifyDevice.isDevice,
            verify2FA.is2FA
        ],
        signinController.signInWocman
    );

    app.post(
        Helpers.apiVersion7()+"wocman-signin-resend-isdevice",
        [
            verifyWocmanSignIn.isEmailVerify
        ],
        isDeviceVC.resendIsDevice
    );


    app.get(
        Helpers.apiVersion7()+"wocman-device-ip-confirm/:iplink",
        [],
        isDeviceVC.activateIsDevice
    );

    app.get(
        Helpers.apiVersion7()+"wocman-device-ip-cancel/:iplink1",
        [],
        isDeviceVC.cancelIsDevice
    );

    app.post(
        Helpers.apiVersion7()+"wocman-signin-resend-otp",
        [
            verifyWocmanSignIn.isEmailVerify
        ],
        verify2FA.resendis2FA
    );

    app.post(
        Helpers.apiVersion7()+"auth/wocman-signin-activate-otp",
        [
            verifyWocmanSignIn.isEmailVerify,
            verifyWocmanSignIn.isPasswordVerify, 
            verifyWocmanSignIn.checkRole,
            verify2FA.activateis2FA
        ],
        signinController.signInWocman
    );

    //a wocman user signs up, wants to login using google,
    //they would hit this endpoint once to login with google button
    //they would be sent to google plattform
    app.get(
        Helpers.apiVersion7()+'google-auth/wocman-signin',
        passport.authenticate('google',
            { scope: ['profile', 'email'] }
        )
    );

    
    //google would redirect them to hit this endpoint once the user login credential with google is true
    //they would be sent to google-auth/wocman-signin-proceed endpoint
    app.get(
        Helpers.apiVersion7()+'google-auth/wocman-signin-callback',
        passport.authenticate('google', { failureRedirect: failUrl } ),
        function(req, res) {
            res.redirect(Helpers.apiVersion7()+"google-auth/wocman-signin-proceed");
        }
    );

    app.get(
        Helpers.apiVersion7()+"google-auth/wocman-signin-failed",
        signinPassportGoogleController.failedSignIn
    );

    //this servers as auth/wocman-signin endpoint
    //then they should be sent to dashboard page if access token returned is not null
    //immediatelly they are sent to dashboard, you call the dashboard endpoint to retrieve all the wocman data(very complex array of profile info, wallet info, job info and settings info)
    //the dashboard endpoint(profile-wocman) is in the wocmanuser.routes.js routes 
    app.get(
        Helpers.apiVersion7()+"google-auth/wocman-signin-proceed",
        signinPassportGoogleController.proceedSignIn
    );

    //a wocman user forgot his/her password,
    //they would hit this endpoint to start password reset process.
    //this sends an email to them with a password recovery link
    app.post(
        Helpers.apiVersion7()+"password-reset-wocman",
        [verifySendPasswordEmail.isEmailVerify],
        sendchangepasswordController.wocmanResetPassword
    );

    //a wocman user requested to reset password,
    //they would hit this endpoint once they click on the link in the recover password email sent to them.
    //this would verify the email is valid and actually requested to reset password
    app.get(
        Helpers.apiVersion7()+"wocman-password-reset/:link",
        [verifyChangePasswordEmail.isLinkVerify],
        confirmpasswordresetController.wocmanResetPasswordConfirm
    );
    //a wocman user clicks the link in reset password email and got confired,
    //they would hit this endpoint once they submit the new password details.
    //this would reset their password for them
    app.post(
        Helpers.apiVersion7()+"wocman-password-reset",
        [verifyResetIn.isEmailVerify, verifyResetIn.isPasswordVerify],
        resetpasswordController.wocmanStartResetPassword
    );

    //admin Website Endpoints

    app.get(
        Helpers.apiVersion7()+"admin-signup-verification/:link",
        [verifyAdminSignUpLink.isLinkVerify],
        adminemailverifyController.checkVerifyEmailLinkWocman
    );

    app.post(
        Helpers.apiVersion7()+"password-reset-admin",
        [verifyAdminSendPasswordEmail.isEmailVerify],
        adminsendchangepasswordController.wocmanResetPassword
    );

    app.get(
        Helpers.apiVersion7()+"admin-password-reset/:link",
        [verifyAdminChangePasswordEmail.isLinkVerify],
        adminconfirmpasswordresetController.wocmanResetPasswordConfirm
    );

    app.post(
        Helpers.apiVersion7()+"admin-password-reset",
        [verifyAdminResetIn.isEmailVerify, verifyAdminResetIn.isPasswordVerify],
        adminresetpasswordController.wocmanStartResetPassword
    );

    app.post(
        Helpers.apiVersion7() + "auth/admin-signup",
        [
            verifyAdminSignUp.isEmailVerify, 
            verifyAdminSignUp.isPasswordVerify, 
            verifyAdminSignUp.isPasswordConfirmed,
            verifyAdminSignUp.checkDuplicateUsernameOrEmail
        ],
        adminsignupController.signUpWocman
    );

    app.post(
        Helpers.apiVersion7()+"auth/admin-signin",
        [
            verifyAdminSignIn.isEmailVerify, 
            verifyAdminSignIn.isPasswordVerify, 
            verifyAdminSignIn.checkRole
        ],
        adminSigninController.signInWocman
    );
};