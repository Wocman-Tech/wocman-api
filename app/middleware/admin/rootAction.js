const { RootAdmin } = require('../../models');

const isRootAction = (req, res, next) => {
    searchemail = {'email': req.email};
    RootAdmin.findOne({
        where: searchemail
    })
    .then(adminroot => {
        if (!adminroot) {
            res.status(403).send({
                statusCode: 403,
                status: false,
                message: "User Not Found",
                data: []
            });
            return;
        }
        req.isLogin = parseInt(adminroot.isLogin, 10);
        req.isprofile = parseInt(adminroot.isprofile, 10);
        req.issettings = parseInt(adminroot.issettings, 10);
        req.iscustomer = parseInt(adminroot.iscustomer, 10);
        req.iswocman = parseInt(adminroot.iswocman, 10);
        req.isproject = parseInt(adminroot.isproject, 10);
        req.isuser = parseInt(adminroot.isuser, 10);
        req.isaccount = parseInt(adminroot.isaccount, 10);
        req.isroot = parseInt(adminroot.isroot, 10);
        
        next();
    })
    .catch(err => {
        res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

const rootAction = {
    isRootAction: isRootAction
};
module.exports = rootAction;