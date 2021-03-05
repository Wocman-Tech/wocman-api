const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
var op = Sequelize.Op;

const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
        host: config.HOST,
        dialect: config.dialect,
        operatorsAliases: false,

        pool: {
            max: config.pool.max,
            min: config.pool.min,
            acquire: config.pool.acquire,
            idle: config.pool.idle
        }
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.userRole = require("../models/userrole.model.js")(sequelize, Sequelize);
db.cert = require("../models/cert.model.js")(sequelize, Sequelize);

db.projecttype = require("../models/projecttype.model.js")(sequelize, Sequelize);
db.projects = require("../models/projects.model.js")(sequelize, Sequelize);
db.wshear = require("../models/wshear.model.js")(sequelize, Sequelize);


db.waChat = require("../models/wocmanadminchat.model.js")(sequelize, Sequelize);

db.wcChat = require("../models/wocmancustomerchat.model.js")(sequelize, Sequelize);
db.wWallet = require("../models/wocmanwallet.model.js")(sequelize, Sequelize);
db.wWalletH = require("../models/wocmanwallethistory.model.js")(sequelize, Sequelize);
db.wrate = require("../models/wocmanrate.model.js")(sequelize, Sequelize);
db.wNotice = require("../models/wocmannotice.model.js")(sequelize, Sequelize);
db.wsetting = require("../models/wsetting.model.js")(sequelize, Sequelize);

db.mtoken = require("../models/tokens.model.js")(sequelize, Sequelize);

db.nletter = require("../models/nletter.model.js")(sequelize, Sequelize);

db.contactus = require("../models/contactus.model.js")(sequelize, Sequelize);


module.exports = db;