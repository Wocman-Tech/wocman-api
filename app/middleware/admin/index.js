const VerifyId = require("./isId");
const verifyAdminUser = require("./isAdmin");
const rootAdmin = require("./rootAdmin");
const rootAction = require("./rootAction");
const initiateAdmin = require("./initiateAdmin");

module.exports = {
    isIdVerify:VerifyId,
    verifyAdminUser,
    rootAdmin,
    rootAction,
    initiateAdmin
};