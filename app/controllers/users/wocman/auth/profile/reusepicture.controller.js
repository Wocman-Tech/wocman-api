const pathRoot = '../../../../../';
const db = require(pathRoot+"models");
const config = require(pathRoot+"config/auth.config");
const fs = require('fs');
const User = db.User;

const Helpers = require(pathRoot+"helpers/helper.js");

const Op = db.Sequelize.Op;

exports.wocmanReuseProfilePicture = (req, res, next) => {
    // Username
    var image =  req.body.image_link;
    
    if (typeof image === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "Image link is undefined.",
                data: []
            }
          );
    }else{
        
        var theimaeg = Helpers.pathToImages() +  'wocman/picture/'+ image.replace(Helpers.coreProjectPath(), '');
        // console.log(theimaeg);
        if (!fs.existsSync(theimaeg)) {
            
            return res.status(404).send(
                {
                    statusCode: 404,
                    status: false,
                    message: "Image does not exist.",
                    data: []
                }
            );
        }else{
            User.findByPk(req.userId).then(user => {
                if (!user) {
                  res.status(400).send({
                    statusCode: 400,
                    status: false,
                    message: "User Not Found",
                    data: []
                  });
                  return;
                }
                user.update({
                    image: image
                })
                .then(() => {
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Profile is re-used",
                        data: {
                            accessToken: req.token
                        }
                    });
                })
                .catch(err => {
                    res.status(500).send({
                        statusCode: 500,
                        status: false, 
                        message: err.message,
                        data: [] 
                    });
                });
            })
            .catch(err => {
                res.status(500).send({
                    statusCode: 500,
                    status: false, 
                    message: err.message,
                    data: [] 
                });
            });
        }
    }
};