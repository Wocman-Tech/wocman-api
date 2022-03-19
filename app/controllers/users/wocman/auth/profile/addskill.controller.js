const { User, Projecttype, Wskills, Wcategory, Category } = require('../../../../../models');
const pathRoot = '../../../../../';
const Helpers = require(pathRoot + "helpers/helper.js");

exports.wocmanAddSkill = (req, res, next) => {
    const skillid = req.body.skillid;
    const user_id = req.userId;

    User.findByPk(user_id).then(users => {
        if (!users) {
            return res.status(404).send({
                statusCode: 400,
                status: false,
                message: "User Not found.",
                data: []
            });
        }
        Projecttype.findOne({
            where: { 'id': skillid },
            include: [
                {
                    model: Category,
                    attributes: {
                        exclude: ['createdAt', 'updatedAt'],
                    },
                },

            ],
        }).then(ds34drsd => {
            if (!ds34drsd) {
                return res.status(404).send({
                    statusCode: 400,
                    status: false,
                    message: "Skill does not exist",
                    data: []
                });
            }
            const catName = ds34drsd.Category.name;
            const skilname = ds34drsd.name;

            Wskills.create({
                userid: user_id,
                skillid: skillid,
            })
                .then(hgh => {

                    const pushUser = user_id;
                    const pushType = 'service';
                    const pushBody = 'Dear ' + users.username + ", <br />You have Declared Your " +
                        " Wocman Category and skill as " + catName + " and  " + skilname + ". <br /> This would be reviewed soon " +
                        "<br />A corresponding response would be sent to you<br/>";

                    Helpers.pushNotice(pushUser, pushBody, pushType);

                    User.update(
                        { isSkilled: 1 },
                        { where: { id: user_id } }
                    );
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Skill was added",
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
        }).catch(err => {
            res.status(500).send({
                statusCode: 500,
                status: false,
                message: err.message,
                data: []
            });
        });
    }).catch(err => {
        res.status(500).send({
            statusCode: 500,
            status: false,
            message: err.message,
            data: []
        });
    });

};

exports.wocmanListSkills = (req, res, next) => {
    var category_id = req.body.category_id;
    if (typeof category_id === "undefined") {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "category_id field is undefined.",
                data: []
            }
        );
    }
    if (req.userId && req.userId !== '') {
        var user_id = req.userId;
    } else {
        return res.status(400).send(
            {
                statusCode: 400,
                status: false,
                message: "User could not be verified",
                data: []
            });
    }

    User.findByPk(user_id).then(users => {
        if (!users) {
            return res.status(404).send({
                statusCode: 400,
                status: false,
                message: "User Not found.",
                data: []
            });
        }
        Category.findOne({
            where: { 'id': category_id }
        })
            .then(isCategory => {
                var categoryName = isCategory.name;
                Skills.findAll({
                    where: { categoryid: category_id }
                }).then(fgrtyrtyfgf => {
                    if (!fgrtyrtyfgf) {
                        return res.status(404).send({
                            statusCode: 400,
                            status: false,
                            message: "Skills does not exist",
                            data: []
                        });
                    }
                    res.status(200).send({
                        statusCode: 200,
                        status: true,
                        message: "Skill was found",
                        data: {
                            category: categoryName,
                            skills: fgrtyrtyfgf,
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
};