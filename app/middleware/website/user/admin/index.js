const verifySignUp = require("./signUp");
const verifySignIn = require("./signIn");
const verifySignUpLink = require("./verifySignUpLink");
const sendChangePassword = require("./sendChangePassword");
const verifyChangePasswordEmail = require("./verifyChangePasswordEmail");
const verifyResetIn = require("./resetPassword");

module.exports = {
  verifyAdminSignUp: verifySignUp,
  verifyAdminSignIn: verifySignIn,
  verifyAdminSignUpLink: verifySignUpLink,
  verifyAdminSendPasswordEmail: sendChangePassword,
  verifyAdminChangePasswordEmail: verifyChangePasswordEmail,
  verifyAdminResetIn: verifyResetIn
};