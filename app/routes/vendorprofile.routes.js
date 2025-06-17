const { authJwt } = require("../middleware/index.js");

const userProfileController = require("../controllers/users/customer/auth/profile/user.profile.controller.js");
const vendorProfileController = require("../controllers/users/vendor/auth/profile/profilepicture.controller.js");
const updateProfileController = require("../controllers/users/vendor/auth/profile/updateprofile.controller.js");

const Helpers = require("../helpers/helper.js");

const multer = require("multer");

const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, "");
  },
});
const uploadSingle = multer({ storage: storage }).single("avatar");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  //auth
  app.get(
    Helpers.apiVersion7() + "vendor/profile",
    [authJwt.verifyToken, authJwt.isVendor],
    userProfileController.profileController
  );

  app.post(
    Helpers.apiVersion7() + "vendor/profile/picture",
    [authJwt.verifyToken, authJwt.isVendor, uploadSingle],
    vendorProfileController.uploadProfilePicture
  );

  app.put(
    Helpers.apiVersion7() + "vendor/profile/update",
    [authJwt.verifyToken, authJwt.isVendor],
    updateProfileController.ProfileUpdate
  );
};
