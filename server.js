require("dotenv/config");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const multer = require("multer");

const path = require("path");

const app = express();

let randomColor = require('randomcolor');

const uuid = require('uuid');
const fs = require('fs');
var http = require('http').Server(app);

const passport = require('passport');
const cookieSession = require('cookie-session');

const { resolve, port, website }  = require("./app/config/auth.config");

var corsOptions = {
    origin: [resolve+port, "http://localhost:3000", "http://localhost:8081", website ],
    default: resolve+port
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

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
const Role = db.role;
const WCchat = db.wcChat;
const Skills = db.skills;

db.sequelize.sync();
// force: true will drop the table if it already exists
// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
// });


// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

// Role.drop();
function initial() {
    Role.create({
        id: 1,
        name: "admin"
    });
 
    Role.create({
        id: 2,
        name: "wocman"
    });
 
    Role.create({
        id: 3,
        name: "customer"
    });
}
function initial1() {

    Skills.create({
        id: 1,
        name: "Barbing Services"
    });
 
    Skills.create({
        id: 2,
        name: "Plumbering Services"
    });
 
    Skills.create({
        id: 3,
        name: "Electrical Installations and Maintenance"
    });

    Skills.create({
        id: 4,
        name: "Mechanical Installations and Maintenance"
    });

    Skills.create({
        id: 5,
        name: "Computer, accessories Installations and Maintenance"
    });
}
// initial1();

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Testing a web app api with node by justice" });
});

// routes
require('./app/routes/website.routes')(app);

require('./app/routes/wocmanprofile.routes')(app);
require('./app/routes/wocmanmessaging.routes')(app);
require('./app/routes/wocmandashboard.routes')(app);
require('./app/routes/wocmanproject.routes')(app);
require('./app/routes/wocmanwallet.routes')(app);
require('./app/routes/wocmansettings.routes')(app);

require('./app/routes/adminuser.routes')(app);
