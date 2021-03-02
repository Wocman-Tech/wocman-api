const { authJwt } = require("../middleware");

const wallet = require("../controllers/users/wocman/auth/wallet/walletdetails.controller");
const walletMHhistory = require("../controllers/users/wocman/auth/wallet/walletchartbymonth.controller");
const walletHistory = require("../controllers/users/wocman/auth/wallet/wallethistory.controller");


const Helpers = require("../helpers/helper.js");

const path = require("path");
const multer = require("multer");

var storageCert = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join('', 'app/', 'uploads/wocman/certificate'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+ path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});
var uploadCert = multer({ 
    storage: storageCert, 
    fileFilter : (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif") {
            cb(null, true);
        }else{
            cb(null, false);
            return cb(new Error('Only jpeg, jpg, png, gif file extensions are allowerd'));
        }
    }
});

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    //project routes

    app.post(
        Helpers.apiVersion7() + "wocman-wallet", 
        [authJwt.verifyToken, authJwt.isWocman], 
        wallet.walletDetails
    );

    app.post(
        Helpers.apiVersion7() + "wocman-month-history", 
        [authJwt.verifyToken, authJwt.isWocman], 
        walletMHhistory.walletDetails
    );

    app.post(
        Helpers.apiVersion7() + "wocman-history",
        [authJwt.verifyToken, authJwt.isWocman], 
        walletHistory.walletDetailsHistory
    );
};