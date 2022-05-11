const pathRoot = '../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.user;
const UserRole = db.userRole;

const Projects = db.projects;

const Helpers = require(pathRoot+"helpers/helper.js");

let nodeGeocoder = require('node-geocoder');

let options = {
    provider: 'openstreetmap'
  };

const Op = db.Sequelize.Op;

exports.locationData = (req, res, next) => {
//Get today's date using the JavaScript Date object.
const newDate = new Date().toLocaleString('en-US', {
  timeZone: 'Africa/Lagos'
});
const ourDate = new Date().toLocaleString('en-US', {
  timeZone: 'Africa/Lagos'
});
var firstDay = new Date(newDate.split(',')[0]);
var pastDate= new Date(firstDay.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleString('en-US', {
  timeZone: 'Africa/Lagos'
});

    var locationName =  req.params.location;
    if (typeof locationName === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "location is undefined.",
                data: []
            }
        );
    }else{

        let geoCoder = nodeGeocoder(options);geoCoder.geocode(locationName)
        .then((locationResult)=> {

            User.findAll({
                attributes: ['id'],
                where: {address: locationName}
            })
            .then(result => {
                const dic = [];
                if (result) {
                    for (var i = 0; i < result.length; i++) {
                        var Rowid = Helpers.getJsondata(result[i].dataValues, 'id');
                        dic.push(Rowid);
                    }
                    
                    var dic2 = [];

                    UserRole.findAll({
                        attributes: ['userid'],
                        where: {roleid: 2 }
                    }).then(wocmanrole => {

                        if (wocmanrole) {
                            for (var i = 0; i < wocmanrole.length; i++) {
                                var Rowid = Helpers.getJsondata(wocmanrole[i].dataValues, 'userid');
                                dic2.push(Rowid);
                            }
                        }

                        var dic1 = [];
                        Projects.findAll({
                            attributes: ['wocmanid'],
                            where: {projectcomplete : 1}
                        }).then(doneProject => {
                            if (doneProject) {
                                for (var i = 0; i < doneProject.length; i++) {
                                    var Rowid = Helpers.getJsondata(doneProject[i].dataValues, 'wocmanid');
                                    dic1.indexOf(Rowid) === -1 ? dic1.push(Rowid):''
                                }
                            }
                            var merge  = 0;
                            for (var i = 0; i < dic2.length; i++) {
                                if(dic.includes(dic2[i]) === true){
                                    merge = merge + 1;
                                }
                            }
                            
                            var todate = [];
                            var alldate = [];
                            UserRole.findAll({
                                attributes: ['userid'],
                                where: {
                                    createdAt: {
                                        [Op.between]: [pastDate, newDate]
                                    },
                                    roleid: 2
                                }
                            })
                            .then(resultbydate => {
                                if (resultbydate) {
                                    for(var i = 0; i < resultbydate.length; i++) {
                                        var Rowid = Helpers.getJsondata(resultbydate[i].dataValues, 'userid');
                                        todate.push(Rowid);
                                    }
                                }

                              
                                UserRole.findAll({
                                    attributes: ['userid'],
                                    where: {roleid: 2}
                                })
                                .then(userroleresult => {
                                    if (userroleresult) {
                                        for(var i = 0; i < userroleresult.length; i++) {
                                            var Rowid = Helpers.getJsondata(userroleresult[i].dataValues, 'userid');
                                            alldate.push(Rowid);
                                        }
                                    }

                                    const weekratio = (todate.length/alldate.length) * 100; //1;
                                    res.status(200).send({
                                        statusCode: 200,
                                        status: true,
                                        message: "Location mapped",
                                        data: {
                                            location: locationName,
                                            data: locationResult,
                                            wocman: merge,
                                            active: dic1.length,
                                            weekly_percentage_increase: weekratio
                                        }
                                    })
                                })
                                .catch((err)=> {
                                    res.status(500).send({
                                        statusCode: 500,
                                        status: false, 
                                        message: err.message,
                                        data: [] 
                                    });
                                });
                               
                            })
                            .catch((err)=> {
                                res.status(500).send({
                                    statusCode: 500,
                                    status: false, 
                                    message: err.message,
                                    data: [] 
                                });
                            });

                        })
                        .catch((err)=> {
                            res.status(500).send({
                                statusCode: 500,
                                status: false, 
                                message: err.message,
                                data: [] 
                            });
                        });
                    })
                    .catch((err)=> {
                        res.status(500).send({
                            statusCode: 500,
                            status: false, 
                            message: err.message,
                            data: [] 
                        });
                    });
                } 
            })
            .catch((err)=> {
                res.status(500).send({
                    statusCode: 500,
                    status: false, 
                    message: err.message,
                    data: [] 
                });
            });
        })
        .catch((err)=> {
            res.status(500).send({
                statusCode: 500,
                status: false, 
                message: err.message,
                data: [] 
            });
        });
    }
};