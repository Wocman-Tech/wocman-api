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

const { resolve, port, website }  = require(pathRoot+"config/auth.config");
const { EMAIL, PASSWORD, MAIN_URL } = require(pathRoot+"helpers/helper.js");
const callbackUrl = Helpers.apiVersion7() + "google-auth/wocman-signin-callback"


passport.serializeUser(function(UserProfileFromGoogle, done) {
    /*
    From the user take just the id (to minimize the cookie size) and just pass the id of the user
    to the done callback
    PS: You dont have to do it like this its just usually done like this
    */
    done(null, UserProfileFromGoogle._json);
});

passport.deserializeUser(function(UserProfileFromGoogle, done) {
    /*
    Instead of user this function usually recives the id 
    then you use the id to select the user from the db and pass the user obj to the done callback
    PS: You can later access this data in any routes in: req.user
    */

    var email = UserProfileFromGoogle.email;
    var username = UserProfileFromGoogle.given_name;
    var password = UserProfileFromGoogle.sub;

    User.findOne({
        where: {email:email}
    }).then(user => {
        if (!user) {
            User.create({
                username: username,
                email: email,
                password: bcrypt.hashSync(password, 8),
                verify_email: 1,
                signuptype: password
            })
            .then(nuser => {
                UserRole.findOne({
                    where: {userid: nuser.id}
                })
                .then(userrole => {
                    if (!userrole) {
                        UserRole.create({
                            userid: nuser.id,
                            roleid: 2
                        });
                    }
                });
               
                done(null, nuser);
            })
            .catch(err => {
                done(null, null);
            });
        }else{
            User.update(
                {
                    password: bcrypt.hashSync(password, 8),
                    signuptype: password
                },
                {
                    where: {email:email}
                }
            );
        }
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
    function(accessToken, refreshToken, UserProfileFromGoogle, done) {
        done(null, UserProfileFromGoogle);
    }
));

