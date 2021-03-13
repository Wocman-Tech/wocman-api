const verifySignUp = require("./signUp");
const verifySignIn = require("./signIn");
const verifySignUpLink = require("./verifySignUpLink");
const sendChangePassword = require("./sendChangePassword");
const verifyChangePasswordEmail = require("./verifyChangePasswordEmail");
const verifyResetIn = require("./resetPassword");
const verifyDevice = require("./verifyDevice");
const verify2FA = require("./verify2FA");

module.exports = {
  verifyWocmanSignUp: verifySignUp,
  verifyWocmanSignIn: verifySignIn,
  verifySignUpLink: verifySignUpLink,
  verifySendPasswordEmail: sendChangePassword,
  verifyChangePasswordEmail: verifyChangePasswordEmail,
  verifyResetIn: verifyResetIn,
  verifyDevice: verifyDevice,
  verify2FA: verify2FA
};