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
const Role = db.Role;
const WCchat = db.WcChat;
const Skills = db.Skills;
const Competency = db.Competency;
const Category = db.Category;

db.sequelize.sync();
// force: true will drop the table if it already exists
// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
//   initial1();
//   initial2();
// });


// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
process.env.TZ = 'Africa/Lagos';

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
        categoryid: 1,
        name: "Barbing Services"
    });
 
    Skills.create({
        id: 2,
        categoryid: 1,
        name: "Plumbering Services"
    });
 
    Skills.create({
        id: 3,
        categoryid: 2,
        name: "Electrical Installations and Maintenance"
    });

    Skills.create({
        id: 4,
        categoryid: 3,
        name: "Mechanical Installations and Maintenance"
    });

    Skills.create({
        id: 5,
        categoryid: 2,
        name: "Computer, accessories Installations and Maintenance"
    });
}
function initial2() {

    Competency.create({
        id: 1,
        name: "Beginner"
    });
 
    Competency.create({
        id: 2,
        name: "Intermediate"
    });
 
    Competency.create({
        id: 3,
        name: "Experienced"
    });

    Category.create({
        id: 1,
        name: "Tradesmen"
    });
 
    Category.create({
        id: 2,
        name: "Technicians"
    });
 
    Category.create({
        id: 3,
        name: "Professionals"
    });
}
// initial1();
// initial2();

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Testing a web app api with node by justice" });
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
