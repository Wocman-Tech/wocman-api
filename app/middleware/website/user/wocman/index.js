const verifySignUp = require("./signUp");
const verifySignIn = require("./signIn");
const verifySignUpLink = require("./verifySignUpLink");

module.exports = {
  verifyWocmanSignUp: verifySignUp,
  verifyWocmanSignIn: verifySignIn,
  verifySignUpLink: verifySignUpLink
};