const verifySignUp = require("./signUp");
const verifySignIn = require("./signIn");
const verifySignUpLink = require("./verifySignUpLink");
const sendChangePassword = require("./sendChangePassword");
const verifyChangePasswordEmail = require("./verifyChangePasswordEmail");
const verifyResetIn = require("./resetPassword");

module.exports = {
  verifyCustomerSignUp: verifySignUp,
  verifyCustomerSignIn: verifySignIn,
  verifyCustomerSignUpLink: verifySignUpLink,
  verifyCustomerSendPasswordEmail: sendChangePassword,
  verifyCustomerChangePasswordEmail: verifyChangePasswordEmail,
  verifyCustomerResetIn: verifyResetIn
};