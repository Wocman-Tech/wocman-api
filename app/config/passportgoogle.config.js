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
    console.log(user.email);
    console.log(user.password);
  
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
        // if (!user) {
        //     User.create({
        //         username: 'Wocman',
        //         email: email,
        //         password: bcrypt.hashSync(req.body.password, 8),
        //         verify_email: verify_email
        //     })
        //     .then(user => {
        //         UserRole.findOne({
        //             where: {userid: user.id}
        //         })
        //         .then(userrole => {
        //           if (!userrole) {
        //             UserRole.create({
        //                 userid: user.id,
        //                 roleid: 2
        //             });
        //           }
        //         });
        //         // then send the email
        //         //source:https://medium.com/javascript-in-plain-english/how-to-send-emails-with-node-js-1bb282f334fe
        //         var verification_link = MAIN_URL.slice(0, -1)+Helpers.apiVersion7()+"wocman-signup-verification/"+ user.verify_email;
        //         let response = {
        //             body: {
        //               name: "Wocman",
        //               intro: "Welcome to Wocman Technology! We're very excited to have you on board. Click or Copy this link to any browser to process your registration: "+verification_link,
        //             },
        //         };

        //         let mail = MailGenerator.generate(response);

        //         let message = {
        //             from: EMAIL,
        //             to:  user.email,
        //             subject: "Signup Successful",
        //             html: mail,
        //         };

        //         transporter.sendMail(message)
        //         .then(() => {
        //              res.status(200).send({
        //                 statusCode: 200,
        //                 status: true,
        //                 message: "User registered successfully!",
        //                 data: {
        //                     link: verification_link, 
        //                     email : user.email, 
        //                     role: 'wocman'
        //                 }
        //             });
        //         })
        //         .catch(err => {
        //             return res.status(500).send({
        //                 statusCode: 500,
        //                 status: false, 
        //                 message: err.message,
        //                 data: [] 
        //             });
        //         });
        //     })
        //     .catch(err => {
        //         return res.status(500).send({ 
        //             statusCode: 500,
        //             status: false, 
        //             message: err.message,
        //             data: [] 
        //         });
        //     });
        // }
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
        console.log(profile);
        var email = profile.emails[0].value;
        done(null, profile);
    }
));
