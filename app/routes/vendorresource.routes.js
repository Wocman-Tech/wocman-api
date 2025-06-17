const { authJwt } = require("../middleware");

const vendorResources = require("../controllers/users/vendor/auth/resource/resource.controller.js");

const Helpers = require("../helpers/helper.js");


module.exports = function (app) {
  app.get(
    Helpers.apiVersion7() + "vendor/resources",
    [authJwt.verifyToken, authJwt.isVendor],
    vendorResources.getVendorResources
  );

  app.get(
    Helpers.apiVersion7() + "customer/resources",
    [authJwt.verifyToken],
    vendorResources.getResourcesByType
  );
};
