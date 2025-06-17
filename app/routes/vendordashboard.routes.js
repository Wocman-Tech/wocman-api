const { authJwt } = require("../middleware");

const featuredVendor = require("../controllers/users/vendor/auth/dashboard/featuredvendor.controller.js");

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
    Helpers.apiVersion7() + "vendor/resource-subtypes",
    [authJwt.verifyToken],
    featuredVendor.getResourceSubtypes
  );

  app.get(
    Helpers.apiVersion7() + "vendor/resource-types",
    [authJwt.verifyToken],
    featuredVendor.getResourceTypes
  );

  app.post(
    Helpers.apiVersion7() + "vendor/resource-upload",
    authJwt.verifyToken,
    authJwt.isVendor,
    uploadJob,
    featuredVendor.uploadResource
  );
};
