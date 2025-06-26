const { authJwt } = require("../middleware");

const vendorOrders = require("../controllers/users/vendor/auth/order/order.controller.js");

const Helpers = require("../helpers/helper.js");

module.exports = function (app) {
  app.get(
    Helpers.apiVersion7() + "vendor/orders",
    authJwt.verifyToken,
    authJwt.isVendor,
    vendorOrders.getVendorOrders
  );
  app.get(
    Helpers.apiVersion7() + "customer/orders",
    authJwt.verifyToken,
    authJwt.isCustomer,
    vendorOrders.getCustomerOrders
  );
  app.patch(
    Helpers.apiVersion7() + "vendor/orders/:orderId/deliver",
    [authJwt.verifyToken, authJwt.isVendor],
    vendorOrders.markOrderAsDelivered
  );
  app.patch(
    Helpers.apiVersion7() + "customer/orders/:id/confirm",
    [authJwt.verifyToken, authJwt.isCustomer],
    vendorOrders.confirmOrderDelivery
  );
};
