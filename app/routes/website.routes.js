const { verifySignUp } = require("../middleware");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');

const { verifyCustomerUser } = require("../middleware/customer");
const { verifyWocmanUser } = require("../middleware/wocman");
const { verifyAdminUser, rootAction, initiateAdmin } = require("../middleware/admin");

const { resolve, port, website }  = require("../config/auth.config");


const { contactUs, search, addNewsLetter } = require("../middleware/website");
const 
    {   
        verifyWocmanSignUp, 
        verifyWocmanSignIn, 
        verifySignUpLink, 
        verifySendPasswordEmail, 
        verifyChangePasswordEmail, 
        verifyResetIn
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


const 
    {   
        verifyCustomerSignUp, 
        verifyCustomerSignIn, 
        verifyCustomerSignUpLink, 
        verifyCustomerSendPasswordEmail, 
        verifyCustomerChangePasswordEmail, 
        verifyCustomerResetIn 
    } = require("../middleware/website/user/customer");


const isDeviceVC = require("../controllers/website/user/wocman/isDevice.controller");
const isOtpVC = require("../controllers/website/user/wocman/isOtp.controller");
const confirmpasswordresetController = require("../controllers/website/user/wocman/confirmpasswordreset.controller");
const emailverifyController = require("../controllers/website/user/wocman/emailverify.controller");
const resetpasswordController = require("../controllers/website/user/wocman/resetpassword.controller");
const sendchangepasswordController = require("../controllers/website/user/wocman/requestpasswordreset.controller");
const signinController = require("../controllers/website/user/wocman/signin.controller");
const signinPassportGoogleController = require("../controllers/website/user/wocman/passportgoogleauth.controller");
const signupController = require("../controllers/website/user/wocman/signup.controller");


const customerisDeviceVC = require("../controllers/website/user/customer/isDevice.controller");
const customerisOtpVC = require("../controllers/website/user/customer/isOtp.controller");
const customerconfirmpasswordresetController = require("../controllers/website/user/customer/confirmpasswordreset.controller");
const customeremailverifyController = require("../controllers/website/user/customer/emailverify.controller");
const customerresetpasswordController = require("../controllers/website/user/customer/resetpassword.controller");
const customersendchangepasswordController = require("../controllers/website/user/customer/requestpasswordreset.controller");
const customersigninController = require("../controllers/website/user/customer/signin.controller");
const customersigninPassportGoogleController = require("../controllers/website/user/customer/passportgoogleauth.controller");
const customersignupController = require("../controllers/website/user/customer/signup.controller");

const adminisDeviceVC = require("../controllers/website/user/admin/isDevice.controller");
const adminisOtpVC = require("../controllers/website/user/admin/isOtp.controller");
const adminconfirmpasswordresetController = require("../controllers/website/user/admin/confirmpasswordresetemail.controller");
const adminemailverifyController = require("../controllers/website/user/admin/emailverify.controller");
const adminresetpasswordController = require("../controllers/website/user/admin/resetpassword.controller");
const adminsendchangepasswordController = require("../controllers/website/user/admin/requestpasswordreset.controller");
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

var storage = multer.memoryStorage({
    destination: function (req, file, cb) {
        cb(null, '');
    }
});
const uploadJob = multer({storage: storage}).array('avatar')

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
            contactUs.isMessageVerify,
            uploadJob
        ], 
        contactController.contactus
    );


    // ------------------------------- //
        //wocman Website Endpoints
    // ---------------------------- //



    //a wocman user wants to register,
    //they would hit this endpoint once they submit their data(email, username and password) for registration.
    //this sends an email to them with a registration verification link

    app.post(
        Helpers.apiVersion7() + "auth/wocman-signup",
        [
            verifyWocmanSignUp.isEmailVerify, 
            verifyWocmanSignUp.isPasswordVerify, 
            verifyWocmanSignUp.isPasswordConfirmed,
            verifyWocmanSignUp.isLink,
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
        [
            verifyWocmanSignUp.isEmailVerify,
            verifyWocmanUser.isWocman
        ],
        emailverifyController.resendEmail
    );

    app.post(
        Helpers.apiVersion7()+"wocman-signup-verification",
        [
            verifyWocmanSignUp.isEmailVerify,
            verifyWocmanUser.isWocman,
            verifyWocmanSignUp.isOtp
        ],
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
            isDeviceVC.isDevice,
            isOtpVC.is2FA
        ],
        signinController.signInWocman
    );

    app.post(
        Helpers.apiVersion7()+"wocman-signin-resend-isdevice",
        [
            verifyWocmanSignIn.isEmailVerify,
            verifyWocmanUser.isWocman
        ],
        isDeviceVC.resendIsDevice
    );


    app.post(
        Helpers.apiVersion7()+"wocman-device-ip-confirm",
        [
            verifyWocmanSignIn.isEmailVerify, 
            verifyWocmanSignIn.isPasswordVerify, 
            verifyWocmanSignIn.checkRole,
            verifyWocmanUser.isWocman,
            isOtpVC.is2FA
        ],
        isDeviceVC.activateIsDevice
    );

    app.post(
        Helpers.apiVersion7()+"wocman-signin-resend-otp",
        [
            verifyWocmanSignIn.isEmailVerify,
            verifyWocmanUser.isWocman
        ],
        isOtpVC.resendIs2FA
    );

    app.post(
        Helpers.apiVersion7()+"auth/wocman-signin-activate-otp",
        [
            verifyWocmanSignIn.isEmailVerify,
            verifyWocmanSignIn.checkRole,
        ],
        isOtpVC.activateIs2FA
    );

    //a wocman user signs up, wants to login using google,
    //they would hit this endpoint once to login with google button
    //they would be sent to google platform
    app.post(
        Helpers.apiVersion7()+'google-auth/wocman-signin',
        [
            verifyWocmanSignUp.isToken,
            verifyWocmanUser.isWocman
        ],
        signinPassportGoogleController.proceedSignIn
    );
    //a wocman user forgot his/her password,
    //they would hit this endpoint to start password reset process.
    //this sends an email to them with a password recovery link
    app.post(
        Helpers.apiVersion7()+"password-reset-wocman",
        [
            verifySendPasswordEmail.isEmailVerify,
            verifyWocmanUser.isWocman
        ],
        sendchangepasswordController.wocmanResetPassword
    );

    //a wocman user clicks the link in reset password email and got confired,
    //they would hit this endpoint once they submit the new password details.
    //this would reset their password for them
    app.post(
        Helpers.apiVersion7()+"wocman-password-reset",
        [
            verifyResetIn.isEmailVerify,
            verifyResetIn.isPasswordVerify,
            verifyWocmanUser.isWocman,
            verifyResetIn.isOtp,
        ],
        resetpasswordController.wocmanStartResetPassword
    );


    // ------------------------------- //
        //Customer
    // ------------------------------- //

    app.post(
        Helpers.apiVersion7() + "auth/customer/signup",
        [
            verifyCustomerSignUp.isEmailVerify, 
            verifyCustomerSignUp.isPasswordVerify, 
            verifyCustomerSignUp.isPasswordConfirmed,
            verifyCustomerSignUp.isLink,
            verifyCustomerSignUp.checkDuplicateUsernameOrEmail
        ],
        customersignupController.signUpCustomer
    );

    app.post(
        Helpers.apiVersion7()+"auth/customer/signup/resend-verification",
        [
            verifyCustomerSignUp.isEmailVerify, verifyCustomerUser.isCustomer
        ],
        customeremailverifyController.resendEmail
    );

    app.post(
        Helpers.apiVersion7()+"auth/customer/signup/verification",
        [
            verifyCustomerSignUp.isEmailVerify,
            verifyCustomerUser.isCustomer,
            verifyCustomerSignUp.isOtp
        ],
        customeremailverifyController.checkVerifyEmailLinkCustomer
    );

    app.post(
        Helpers.apiVersion7()+"auth/customer/signin",
        [
            verifyCustomerSignIn.isEmailVerify, 
            verifyCustomerSignIn.isPasswordVerify, 
            verifyCustomerSignIn.checkRole,
            verifyCustomerUser.isCustomer,
            customerisDeviceVC.isCustomerDevice,
            customerisOtpVC.isCustomer2FA
        ],
        customersigninController.signInCustomer
    );

    app.post(
        Helpers.apiVersion7()+"auth/customer/signin/resend-isdevice",
        [
            verifyCustomerSignIn.isEmailVerify, verifyCustomerUser.isCustomer
        ],
        customerisDeviceVC.resendIsCustomerDevice
    );

    app.post(
        Helpers.apiVersion7()+"auth/customer/device-ip-confirm",
        [
            verifyCustomerSignIn.isEmailVerify, 
            verifyCustomerSignIn.isPasswordVerify, 
            verifyCustomerSignIn.checkRole,
            verifyCustomerUser.isCustomer,
            customerisOtpVC.isCustomer2FA
        ],
        customerisDeviceVC.activateIsCustomerDevice
    );

    app.post(
        Helpers.apiVersion7()+"auth/customer/signin/resend-otp",
        [
            verifyCustomerSignIn.isEmailVerify,
            verifyCustomerUser.isCustomer
        ],
        customerisOtpVC.resendIsCustomer2FA
    );

    app.post(
        Helpers.apiVersion7()+"auth/customer/signin/activate-otp",
        [
            verifyCustomerSignIn.isEmailVerify,
            verifyCustomerSignIn.isPasswordVerify, 
            verifyCustomerSignIn.checkRole,
            verifyCustomerUser.isCustomer
        ],
        customerisOtpVC.activateIsCustomer2FA
    );

    app.post(
        Helpers.apiVersion7()+'auth/customer/google/signin',
        [
            verifyCustomerSignUp.isToken,
            verifyCustomerUser.isCustomer
        ],
        customersigninPassportGoogleController.proceedSignIn
    );
   
    app.post(
        Helpers.apiVersion7()+"auth/customer/password/reset",
        [
            verifyCustomerSendPasswordEmail.isEmailVerify,
            verifyCustomerUser.isCustomer
        ],
        customersendchangepasswordController.customerResetPassword
    );

    app.post(
        Helpers.apiVersion7()+"auth/customer/reset/password",
        [
            verifyCustomerResetIn.isEmailVerify, 
            verifyCustomerResetIn.isPasswordVerify, 
            verifyCustomerResetIn.isOtp,
            verifyCustomerUser.isCustomer
        ],
        customerresetpasswordController.customerStartResetPassword
    );



    // ------------------------------- //
        //admin  Endpoints
    // ------------------------------- //

    app.post(
        Helpers.apiVersion7()+"auth/admin/signup/resend-verification",
        [   
            initiateAdmin.isInitiateAdmin,
            rootAction.isRootAction,
            verifyAdminUser.isAdmin,
            verifyAdminSignIn.isEmailVerify
        ],
        adminemailverifyController.resendEmail
    );

    app.post(
        Helpers.apiVersion7()+"auth/admin/signup/verification",
        [
            initiateAdmin.isInitiateAdmin,
            rootAction.isRootAction,
            verifyAdminUser.isAdmin,
            verifyAdminSignIn.isEmailVerify,
            verifyAdminResetIn.isOtp
        ],
        adminemailverifyController.verifyEmailAdmin
    );

    app.post(
        Helpers.apiVersion7()+"auth/admin/signin",
        [
            initiateAdmin.isInitiateAdmin,
            rootAction.isRootAction,
            verifyAdminUser.isAdmin,
            verifyAdminSignIn.isEmailVerify, 
            verifyAdminSignIn.isPasswordVerify, 
            verifyAdminSignIn.checkRole,
            adminisDeviceVC.isAdminDevice,
            adminisOtpVC.isAdmin2FA
        ],
        adminSigninController.signInAdmin
    );

    app.post(
        Helpers.apiVersion7()+"auth/admin/signin/resend-isdevice",
        [
            initiateAdmin.isInitiateAdmin,
            rootAction.isRootAction,
            verifyAdminUser.isAdmin,
            verifyAdminSignIn.isEmailVerify
        ],
        adminisDeviceVC.resendIsAdminDevice
    );

    app.post(
        Helpers.apiVersion7()+"auth/admin/device-ip-confirm",
        [
            initiateAdmin.isInitiateAdmin,
            rootAction.isRootAction,
            verifyAdminUser.isAdmin,
            verifyAdminSignIn.isEmailVerify, 
            verifyAdminSignIn.isPasswordVerify, 
            verifyAdminSignIn.checkRole,
            adminisOtpVC.isAdmin2FA
        ],
        adminisDeviceVC.activateIsAdminDevice
    );

    app.post(
        Helpers.apiVersion7()+"auth/admin/signin/resend-otp",
        [
            initiateAdmin.isInitiateAdmin,
            rootAction.isRootAction,
            verifyAdminUser.isAdmin,
            verifyAdminSignIn.isEmailVerify

        ],
        adminisOtpVC.resendIsAdmin2FA
    );

    app.post(
        Helpers.apiVersion7()+"auth/admin/signin/activate-otp",
        [
            initiateAdmin.isInitiateAdmin,
            rootAction.isRootAction,
            verifyAdminUser.isAdmin,
            verifyAdminSignIn.isEmailVerify,
            verifyAdminSignIn.isPasswordVerify, 
            verifyAdminSignIn.checkRole

        ],
        adminisOtpVC.activateIsAdmin2FA
    );
   
    app.post(
        Helpers.apiVersion7()+"auth/admin/password/reset",
        [
            initiateAdmin.isInitiateAdmin,
            rootAction.isRootAction,
            verifyAdminUser.isAdmin,
            verifyAdminSendPasswordEmail.isEmailVerify
        ],
        adminsendchangepasswordController.adminResetPassword
    );

    app.post(
        Helpers.apiVersion7()+"auth/admin/reset/password",
        [
            initiateAdmin.isInitiateAdmin,
            rootAction.isRootAction,
            verifyAdminUser.isAdmin,
            verifyAdminResetIn.isEmailVerify, 
            verifyAdminResetIn.isPasswordVerify, 
            verifyAdminResetIn.isOtp
        ],
        adminresetpasswordController.adminStartResetPassword
    );
};