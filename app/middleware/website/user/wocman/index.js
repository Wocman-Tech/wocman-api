const verifySignUp = require("./signUp");
const verifySignIn = require("./signIn");
const verifySignUpLink = require("./verifySignUpLink");
const sendChangePassword = require("./sendChangePassword");
const verifyChangePasswordEmail = require("./verifyChangePasswordEmail");
const verifyResetIn = require("./resetPassword");

module.exports = {
  verifyWocmanSignUp: verifySignUp,
  verifyWocmanSignIn: verifySignIn,
  verifySignUpLink: verifySignUpLink,
  verifySendPasswordEmail: sendChangePassword,
  verifyChangePasswordEmail: verifyChangePasswordEmail,
  verifyResetIn: verifyResetIn
};