require("dotenv/config");
const express = require("express");
const cors = require("cors");
const fs = require('fs');
const morgan = require('morgan');
const FileStreamRotator = require('file-stream-rotator');
const { loggerInit } = require('./app/config/logger');

const app = express();

const passport = require('passport');
const cookieSession = require('cookie-session');

const logDirectory = './logs';
const checkLogDir = fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

let accessLogStream;
let logger;

// initialize logger
if (app.get('env') === 'development') {
    logger = loggerInit('development');
} else if (app.get('env') === 'production') {
    logger = loggerInit('production');
} else if (app.get('env') === 'test') {
    logger = loggerInit('test');
} else {
    logger = loggerInit();
}

global.logger = logger;
logger.info('Application starting...');
logger.debug('Overriding \'Express\' logger');

if (checkLogDir) {
    accessLogStream = FileStreamRotator.getStream({
        date_format: 'YYYYMMDD',
        filename: `${logDirectory}/access-%DATE%.log`,
        frequency: 'weekly',
        verbose: false,
    });
}

app.use(morgan('combined', { stream: accessLogStream }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers',
        'Authorization, Origin, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


// session variables
app.use(cookieSession({
    name: 'tuto-session',
    keys: ['key1', 'key2']
}))

// Initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());

// database
const db = require("./app/models");
const { errorResponse } = require("./app/helpers/error.helper");
const Role = db.role;
const WCchat = db.wcChat;
const Skills = db.skills;
const Competency = db.competency;
const Category = db.category;


// set port, listen for requests
const PORT = process.env.PORT || 3306;

db.sequelize
  .authenticate()
  .then(() => {
    logger.info('Connection has been established successfully.');
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}.`);
    });
  })
  .catch((error) => {
    logger.error(error.message);
  });

process.env.TZ = 'Africa/Lagos';

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Wocman API" });
});


//*-----------------------------------------*//

// website routes

//*-----------------------------------------*//


require('./app/routes/website.routes')(app);


//*-----------------------------------------*//

// wocman routes

//*-----------------------------------------*//


require('./app/routes/wocmandashboard.routes')(app);
require('./app/routes/wocmanprofile.routes')(app);
require('./app/routes/wocmansettings.routes')(app);
require('./app/routes/wocmanmessaging.routes')(app);

require('./app/routes/wocmanproject.routes')(app);
require('./app/routes/wocmanwallet.routes')(app);



//*-----------------------------------------*//

// customer routes

//*-----------------------------------------*//



require('./app/routes/customerdashboard.routes')(app);
require('./app/routes/customerprofile.routes')(app);
require('./app/routes/customersettings.routes')(app);
require('./app/routes/customermessaging.routes')(app);
require('./app/routes/customerwocstation.routes')(app);



//*-----------------------------------------*//

// admin routes

//*-----------------------------------------*//


require('./app/routes/adminuser.routes')(app);
require('./app/routes/admindashboard.routes')(app);
require('./app/routes/adminwocman.routes')(app);
require('./app/routes/admincustomer.routes')(app);
require('./app/routes/adminwebsite.routes')(app);
require('./app/routes/adminproject.routes')(app);
require('./app/routes/adminaccounts.routes')(app);
require('./app/routes/adminprofile.routes')(app);
require('./app/routes/adminsettings.routes')(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// will print stacktrace
app.use((err, req, res, next) => {
    errorResponse(err, req, res);
});