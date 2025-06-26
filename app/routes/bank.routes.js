const { authJwt } = require("../middleware");

const userBank = require("../controllers/users/vendor/auth/bank/bank.controller.js");

const Helpers = require("../helpers/helper.js");

module.exports = function (app) {
  app.get(
    Helpers.apiVersion7() + "user/bank-details",
    authJwt.verifyToken,
    userBank.getBankDetails
  );
  app.patch(
    Helpers.apiVersion7() + "user/bank-details",
    authJwt.verifyToken,
    userBank.updateBankDetails
  );
};
