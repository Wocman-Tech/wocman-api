const { authJwt } = require("../middleware");

const vendorResources = require("../controllers/users/vendor/auth/resource/resource.controller.js");

const Helpers = require("../helpers/helper.js");

const multer = require("multer");

const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, "");
  },
});
const uploadJob = multer({ storage: storage }).array("avatar");

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

  app.put(
    Helpers.apiVersion7() + "vendor/resources/:id",
    authJwt.verifyToken,
    authJwt.isVendor,
    uploadJob,
    vendorResources.updateResourceById
  );
};
