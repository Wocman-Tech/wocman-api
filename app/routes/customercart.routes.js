const { authJwt } = require("../middleware");

const cartController = require("../controllers/users/vendor/auth/cart/cart.controller.js");

const Helpers = require("../helpers/helper.js");

module.exports = function (app) {
  app.post(
    Helpers.apiVersion7() + "customer/cart/add",
    [authJwt.verifyToken, authJwt.isCustomer],
    cartController.addToCart
  );

  app.post(
    Helpers.apiVersion7() + "customer/cart/remove",
    [authJwt.verifyToken, authJwt.isCustomer],
    cartController.removeFromCart
  );

  app.get(
    Helpers.apiVersion7() + "customer/cart",
    [authJwt.verifyToken, authJwt.isCustomer],
    cartController.viewCart
  );
  app.post(
    Helpers.apiVersion7() + "customer/cart/increment",
    [authJwt.verifyToken, authJwt.isCustomer],
    cartController.incrementCartItem
  );

  app.post(
    Helpers.apiVersion7() + "customer/cart/decrement",
    [authJwt.verifyToken, authJwt.isCustomer],
    cartController.decrementCartItem
  );

  app.get(
    Helpers.apiVersion7() + "customer/cart/total",
    [authJwt.verifyToken, authJwt.isCustomer],
    cartController.getCartTotal
  );

  app.post(
    Helpers.apiVersion7() + "customer/cart/checkout",
    [authJwt.verifyToken, authJwt.isCustomer],
    cartController.checkout
  );
};
