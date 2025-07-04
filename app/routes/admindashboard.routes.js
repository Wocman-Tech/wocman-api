const { authJwt } = require("../middleware");
const {
  isIdVerify,
  verifyAdminUser,
  rootAdmin,
  rootAction,
  initiateAdmin,
} = require("../middleware/admin");

const adminNavAndUserController = require("../controllers/users/admin/auth/dashboard/navanduser.controller");
const adminAccountAndProjectController = require("../controllers/users/admin/auth/dashboard/accountandproject.controller");
const dashboardController = require("../controllers/admin/dashboard.controller");
const chatController = require("../controllers/admin/chat.controller.js");

const Helpers = require("../helpers/helper.js");

const { verifyAdminSignUp } = require("../middleware/website/user/admin");

module.exports = function (app) {
  app.get(
    Helpers.apiVersion7() + "admin/dashboard/projects",
    [authJwt.verifyToken, authJwt.isAdmin],
    dashboardController.getProjects
  );

  app.get(
    Helpers.apiVersion7() + "admin/dashboard/projects/metrics",
    [authJwt.verifyToken, authJwt.isAdmin],
    dashboardController.getProjectMetrics
  );

  app.put(
    Helpers.apiVersion7() + "admin/dashboard/projects/amount/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    dashboardController.addProjectAmount
  );

  app.post(
    Helpers.apiVersion7() + "admin/dashboard/projects/payment",
    [authJwt.verifyToken, authJwt.isCustomer],
    dashboardController.addProjectPayment
  );

  app.get(
    Helpers.apiVersion7() + "admin/dashboard/projects/:id",
    [authJwt.verifyToken],
    dashboardController.getSingleProject
  );

  app.put(
    Helpers.apiVersion7() + "admin/dashboard/projects/approve/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    dashboardController.approveProject
  );

  app.post(
    Helpers.apiVersion7() + "admin/chat/log",
    [authJwt.verifyToken, authJwt.isAdmin],
    chatController.chatLog
  );

  app.post(
    Helpers.apiVersion7() + "admin/chat/send",
    [authJwt.verifyToken, authJwt.isAdmin],
    chatController.chatSave
  );

  app.post(
    Helpers.apiVersion7() + "admin/nav",
    [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
    adminNavAndUserController.nav
  );

  app.post(
    Helpers.apiVersion7() + "admin/dashboard/total/admins",
    [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
    adminNavAndUserController.admins
  );

  app.post(
    Helpers.apiVersion7() + "admin/dashboard/total/wocmen",
    [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
    adminNavAndUserController.wocmen
  );

  app.post(
    Helpers.apiVersion7() + "admin/dashboard/total/customers",
    [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
    adminNavAndUserController.customers
  );

  app.post(
    Helpers.apiVersion7() + "admin/dashboard/total/income",
    [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
    adminAccountAndProjectController.received
  );

  app.post(
    Helpers.apiVersion7() + "admin/dashboard/total/expenses",
    [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
    adminAccountAndProjectController.spent
  );

  app.post(
    Helpers.apiVersion7() + "admin/dashboard/total/projects",
    [authJwt.verifyToken, authJwt.isAdmin, rootAction.isRootAction],
    adminAccountAndProjectController.projects
  );
};
