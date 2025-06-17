const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const envConfigs = require("../config/db.config.js");

const basename = path.basename(__filename);

const env = process.env.NODE_ENV || "development";
const config = envConfigs[env];

let sequelize;
if (config.url) {
  sequelize = new Sequelize(config.url, config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

const db = {};

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.competency = require("../models/competency.model.js")(sequelize, Sequelize);
db.wcompetency = require("../models/wcompetency.model.js")(
  sequelize,
  Sequelize
);
db.category = require("../models/category.model.js")(sequelize, Sequelize);
db.wcategory = require("../models/wcategory.model.js")(sequelize, Sequelize);
db.skills = require("../models/skills.model.js")(sequelize, Sequelize);
db.wskills = require("../models/wskills.model.js")(sequelize, Sequelize);
db.userRole = require("../models/userrole.model.js")(sequelize, Sequelize);
db.cert = require("../models/cert.model.js")(sequelize, Sequelize);
db.ipblacklist = require("../models/wipblacklist.model.js")(
  sequelize,
  Sequelize
);

db.projecttype = require("../models/projecttype.model.js")(
  sequelize,
  Sequelize
);
db.projects = require("../models/projects.model.js")(sequelize, Sequelize);
db.wshear = require("../models/wshear.model.js")(sequelize, Sequelize);

db.waChat = require("../models/wocmanadminchat.model.js")(sequelize, Sequelize);
db.imageStore = require("../models/imagestore.model.js")(sequelize, Sequelize);

db.wcChat = require("../models/wocmancustomerchat.model.js")(
  sequelize,
  Sequelize
);
db.wWallet = require("../models/wocmanwallet.model.js")(sequelize, Sequelize);
db.wWalletH = require("../models/wocmanwallethistory.model.js")(
  sequelize,
  Sequelize
);
db.wrate = require("../models/wocmanrate.model.js")(sequelize, Sequelize);
db.wNotice = require("../models/wocmannotice.model.js")(sequelize, Sequelize);
db.wsetting = require("../models/wsetting.model.js")(sequelize, Sequelize);

db.mtoken = require("../models/tokens.model.js")(sequelize, Sequelize);

db.nletter = require("../models/nletter.model.js")(sequelize, Sequelize);

db.contactus = require("../models/contactus.model.js")(sequelize, Sequelize);

db.accounts = require("../models/accounts.model.js")(sequelize, Sequelize);

db.rootadmin = require("../models/adminroot.model.js")(sequelize, Sequelize);

db.resourcesubtype = require("../models/reseourcesubtype.model.js")(
  sequelize,
  Sequelize
);

db.resourcetype = require("../models/resourcetype.model.js")(
  sequelize,
  Sequelize
);

db.resources = require("../models/resources.model.js")(sequelize, Sequelize);

db.cart = require("../models/cart.model.js")(sequelize, Sequelize);

module.exports = db;
