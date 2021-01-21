const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const pathRoot = '../';

const Helpers = require(pathRoot+"helpers/helper.js");
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.user;
const Role = db.role;
const UserRole = db.userRole;


const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");

const callbackUrl = Helpers.apiVersion7() + "google-auth/wocman-signin-callback"


passport.serializeUser(function(user, done) {
  
    /*
    From the user take just the id (to minimize the cookie size) and just pass the id of the user
    to the done callback
    PS: You dont have to do it like this its just usually done like this
    */
    done(null, user.emails[0].value);
});

passport.deserializeUser(function(email, done) {
    /*
    Instead of user this function usually recives the id 
    then you use the id to select the user from the db and pass the user obj to the done callback
    PS: You can later access this data in any routes in: req.user
    */
    User.findOne({
        where: {email:email}
    }).then(user => {
        done(null, user);
    })
    .catch(err => {
        done(null, null);       
    });
});

passport.use(new GoogleStrategy({
        clientID: "41617709370-91tu56ot8gqk51ngetncu3b5austpjon.apps.googleusercontent.com",
        clientSecret: "rjyf2fcqN58cHFJK1aRWt7bb",
        callbackURL:  callbackUrl
    },
    function(accessToken, refreshToken, profile, done) {
        var email = profile.emails[0].value;
        done(null, profile);
    }
));
