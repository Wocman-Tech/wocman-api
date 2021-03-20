
const baseUrl = "../../../../";
const db = require(baseUrl+"models");
const User = db.user;
const UserRole = db.userRole;
const Role = db.role;
const Cert = db.cert;
const Helpers = require(baseUrl+"helpers/helper.js");
const Joi = require('joi');
const Wsetting = db.wsetting;



const { resolve, port, website, name, otpId }  = require(baseUrl + "config/auth.config.js");
const schemaJoiOTP = Joi.object({
    otps: Joi.number().min(100000).required()
});

const messagebird = require('messagebird')(otpId);

is2FA = (req, res, next) => {

    var searchemail = {};
    if(req.body.email && req.body.email !== ''){
        searchemail = {'email': req.body.email}
    }else{
        searchemail = {'email': {$not: null}};
    }

    User.findOne({
        where: searchemail
    })
    .then(user => {
        if (!user) {
            return res.status(404).send({
                statusCode: 404,
                status: false,
                message: "User Not found.",
                date: []
            });
        }
        var searchuser = {'userid': user.id};

        Wsetting.findOne({
            where: searchuser
        })
        .then(hasSettings => {
            if (!hasSettings) {
                Wsetting.create({
                    userid: user.id
                });
            }
            Wsetting.findOne({
                where: searchuser
            })
            .then(usersettings => {
                if (!usersettings) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "User Settings not found.",
                        date: []
                    });
                }

                if (usersettings.security2fa != 0) {
					const otp = Math.floor(100000 + Math.random() * 900000);


					var messageParams = {
					  'originator': 'MessageBird',
					  'recipients': [
					    user.phone
					],
					  'body': otp + ' is your ' + name + ' verification code'
					};

					messagebird.messages.create(messageParams, function (err, response) {
					if (err) {
					    return console.log(err);
					}
					// console.log(response);
					});
					User.update(
						{
							weblogin2fa: otp
					  	},
					  	{
					  		where: {id: user.id}
					  	}
					);
					return res.status(200).send({
	                    statusCode: 200,
	                    status: true, 
	                    message: 'An OTP Was Sent',
	                    data: {
	                    	opt: otp
	                    } 
	                });
                }else{
                    next(); 
                }
            })
            .catch(err => {
                return res.status(500).send({
                    statusCode: 500,
                    status: false, 
                    message: err.message,
                    data: [] 
                });
            });
        })
        .catch(err => {
            return res.status(500).send({
                statusCode: 500,
                status: false, 
                message: err.message,
                data: [] 
            });
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

resendis2FA = (req, res, next) => {

    var searchemail = {};
    if(req.body.email && req.body.email !== ''){
        searchemail = {'email': req.body.email}
    }else{
        searchemail = {'email': {$not: null}};
    }

    User.findOne({
        where: searchemail
    })
    .then(user => {
        if (!user) {
            return res.status(404).send({
                statusCode: 404,
                status: false,
                message: "User Not found.",
                date: []
            });
        }
        var searchuser = {'userid': user.id};

        Wsetting.findOne({
            where: searchuser
        })
        .then(hasSettings => {
            if (!hasSettings) {
                Wsetting.create({
                    userid: user.id
                });
            }
            Wsetting.findOne({
                where: searchuser
            })
            .then(usersettings => {
                if (!usersettings) {
                    return res.status(404).send({
                        statusCode: 404,
                        status: false,
                        message: "User Settings not found.",
                        date: []
                    });
                }

                if (usersettings.security2fa != 0) {
					const otp = Math.floor(100000 + Math.random() * 900000);
                	

					var messageParams = {
					  'originator': 'MessageBird',
					  'recipients': [
					    user.phone
					],
					  'body': otp + ' is your ' + name + ' verification code'
					};

					messagebird.messages.create(messageParams, function (err, response) {
					if (err) {
					    return console.log(err);
					}
					// console.log(response);
					});
					User.update(
						{
							weblogin2fa: otp
					  	},
					  	{
					  		where: {id: user.id}
					  	}
					);
					return res.status(200).send({
	                    statusCode: 200,
	                    status: true, 
	                    message: 'An OTP Was Sent',
	                    data: {
	                    	otp: otp
	                    }
	                });
                }else{
                    return res.status(404).send({
	                    statusCode: 404,
	                    status: false, 
	                    message: 'User Settings does not include OTP',
	                    data: [] 
	                });
                }
            })
            .catch(err => {
                return res.status(500).send({
                    statusCode: 500,
                    status: false, 
                    message: err.message,
                    data: [] 
                });
            });
        })
        .catch(err => {
            return res.status(500).send({
                statusCode: 500,
                status: false, 
                message: err.message,
                data: [] 
            });
        });
    })
    .catch(err => {
        return res.status(500).send({
            statusCode: 500,
            status: false, 
            message: err.message,
            data: [] 
        });
    });
};

activateis2FA = (req, res, next) => {
    var searchemail = {};
    var otps = req.body.otps;
    var email = req.body.email;

   
    if (typeof email === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Email link is undefined.",
                data: []
            }
          );
    }else{
    	if (typeof otps === "undefined") {
	        return res.status(400).send(
	            {
	                statusCode: 400,
	                status: false,
	                message: "OTP is undefined.",
	                data: []
	            }
	        );
	    }else{

	    	if(email && email !== ''){
		        searchemail = {'email': email, 'weblogin2fa': otps}
		    }else{
		        searchemail = {'email': {$not: null}, 'weblogin2fa': {$not: null} };
		    }

	    	var joyresult = schemaJoiOTP.validate({ otps: otps });
            var { value, error } = joyresult;
            if (!(typeof error === 'undefined')) {
                var msg = Helpers.getJsondata(error, 'details')[0];
                var msgs = Helpers.getJsondata(msg, 'message');
                return res.status(422).json({
                    statusCode: 422,
                    status: false,
                    message: msgs,
                    data: []
                })
            }else{

			    User.findOne({
			        where: searchemail
			    })
			    .then(user => {
			        if (!user) {
			            return res.status(404).send({
			                statusCode: 404,
			                status: false,
			                message: "User Not found.",
			                date: []
			            });
			        }
			        var searchuser = {'userid': user.id};
			        Wsetting.findOne({
			            where: searchuser
			        })
			        .then(usersettings => {
			            if (!usersettings) {
			                return res.status(404).send({
			                    statusCode: 404,
			                    status: false,
			                    message: "User Settings not found.",
			                    date: []
			                });
			            }

			            if (usersettings.security2fa != 0) {
			            	if (user.weblogin2fa == otps) {

				            	User.update(
								{
									weblogin2fa: null
							  	},
							  	{
							  		where: {id: user.id}
							  	}
								);
								next();
			            	}else{
			            		return res.status(404).send({
			                        statusCode: 404,
			                        status: false, 
			                        message: 'Invalid OTP',
			                        data: [] 
			                    });
			            	}
			            }else{
			                return res.status(404).send({
			                    statusCode: 404,
			                    status: false, 
			                    message: 'User Settings does not include OTP',
			                    data: []
			                });
			            }
			        })
			        .catch(err => {
			            return res.status(500).send({
			                statusCode: 500,
			                status: false, 
			                message: err.message,
			                data: [] 
			            });
			        });
			    })
			    .catch(err => {
			        return res.status(500).send({
			            statusCode: 500,
			            status: false, 
			            message: err.message,
			            data: [] 
			        });
			    });
			}
		}
	}
};

const verify2FA = {
    is2FA: is2FA,
    resendis2FA: resendis2FA,
    activateis2FA: activateis2FA
};

module.exports = verify2FA;