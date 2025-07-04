const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const { User, UserRole, Role } = require("../models");
const Helpers = require("../helpers/helper.js");
const Joi = require("joi");

const verifyToken = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(403).send({
      statusCode: 403,
      status: false,
      message: "No token provided!",
      data: [],
    });
  }

  const { headers, body, params } = req;
  const joyvalidateSchema = Joi.object()
    .keys({
      authorization: Joi.string().required().min(100),
    })
    .options({ allowUnknown: true });

  const joyresult = joyvalidateSchema.validate(headers);
  const { value, error } = joyresult;
  if (!(typeof error === "undefined")) {
    var msg = Helpers.getJsondata(error, "details")[0];
    var msgs = Helpers.getJsondata(msg, "message");
    return res.status(422).json({
      statusCode: 422,
      status: false,
      message: msgs,
      data: [],
    });
  }

  token = token.replace("Bearer ", "");

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        statusCode: 401,
        status: false,
        message: "Unauthorized!",
        data: [],
      });
    }

    User.findByPk(decoded.id)
      .then((users) => {
        if (!users) {
          res.status(403).send({
            statusCode: 403,
            status: false,
            message: "User Not Found",
            data: [],
          });
          return;
        }
        req.userId = decoded.id;
        req.token = token;
        next();
      })
      .catch((err) => {
        res.status(500).send({
          statusCode: 500,
          status: false,
          message: err.message,
          data: [],
        });
      });
  });
};

const isAdmin = (req, res, next) => {
  User.findByPk(req.userId)
    .then((users) => {
      if (!users) {
        res.status(403).send({
          statusCode: 403,
          status: false,
          message: "Admin User Not Found",
          data: [],
        });
        return;
      }
      UserRole.findOne({
        where: { userid: req.userId },
      })
        .then((userrole) => {
          if (!userrole) {
            res.status(403).send({
              statusCode: 403,
              status: false,
              message: "Role not found",
              data: [],
            });
            return;
          }

          Role.findOne({
            where: { id: userrole.roleid },
          })
            .then((roles) => {
              if (!roles) {
                res.status(403).send({
                  statusCode: 403,
                  status: false,
                  message: "Require Admin Role!",
                  data: [],
                });
                return;
              }
              if (roles.name == "admin") {
                req.email = users.email;
                req.email_link = users.verify_email;
                next();
              } else {
                res.status(403).send({
                  statusCode: 403,
                  status: false,
                  message: "Role mis-matched",
                  data: [],
                });
                return;
              }
            })
            .catch((err) => {
              res.status(500).send({
                statusCode: 500,
                status: false,
                message: err.message,
                data: [],
              });
            });
        })
        .catch((err) => {
          res.status(500).send({
            statusCode: 500,
            status: false,
            message: err.message,
            data: [],
          });
        });
    })
    .catch((err) => {
      res.status(500).send({
        statusCode: 500,
        status: false,
        message: err.message,
        data: [],
      });
    });
};

const isWocman = (req, res, next) => {
  User.findByPk(req.userId)
    .then((users) => {
      if (!users) {
        res.status(403).send({
          statusCode: 403,
          status: false,
          message: "User Not Found",
          data: [],
        });
        return;
      }
      UserRole.findOne({
        where: { userid: req.userId },
      })
        .then((userrole) => {
          if (!userrole) {
            res.status(403).send({
              statusCode: 403,
              status: false,
              message: "Role not found",
              data: [],
            });
            return;
          }

          Role.findOne({
            where: { id: userrole.roleid },
          })
            .then((roles) => {
              if (!roles) {
                res.status(403).send({
                  statusCode: 403,
                  status: false,
                  message: "Require Wocman Role!",
                  data: [],
                });
                return;
              }
              if (roles.name == "wocman") {
                req.email = users.email;
                req.email_link = users.verify_email;
                next();
              } else {
                res.status(403).send({
                  statusCode: 403,
                  status: false,
                  message: "Role mis-matched",
                  data: [],
                });
                return;
              }
            })
            .catch((err) => {
              res.status(500).send({
                statusCode: 500,
                status: false,
                message: err.message,
                data: [],
              });
            });
          if (parseInt(users.loginlogout, 10) == 1) {
            return res.status(403).send({
              statusCode: 403,
              status: false,
              message: "Logged out.",
              data: {
                accessToken: null,
              },
            });
          }
        })
        .catch((err) => {
          res.status(500).send({
            statusCode: 500,
            status: false,
            message: err.message,
            data: [],
          });
        });
    })
    .catch((err) => {
      res.status(500).send({
        statusCode: 500,
        status: false,
        message: err.message,
        data: [],
      });
    });
};

const isCustomer = (req, res, next) => {
  User.findByPk(req.userId)
    .then((users) => {
      if (!users) {
        res.status(403).send({
          statusCode: 403,
          status: false,
          message: "User Not Found",
          data: [],
        });
        return;
      }
      UserRole.findOne({
        where: { userid: req.userId },
      })
        .then((userrole) => {
          if (!userrole) {
            res.status(403).send({
              statusCode: 403,
              status: false,
              message: "Role not found",
              data: [],
            });
            return;
          }

          Role.findOne({
            where: { id: userrole.roleid },
          })
            .then((roles) => {
              if (!roles) {
                res.status(403).send({
                  statusCode: 403,
                  status: false,
                  message: "Require Customer Role!",
                  data: [],
                });
                return;
              }
              if (roles.name == "customer") {
                req.email = users.email;
                req.email_link = users.verify_email;
                next();
              } else {
                res.status(403).send({
                  statusCode: 403,
                  status: false,
                  message: "Role mis-matched",
                  data: [],
                });
                return;
              }
            })
            .catch((err) => {
              res.status(500).send({
                statusCode: 500,
                status: false,
                message: err.message,
                data: [],
              });
            });
        })
        .catch((err) => {
          res.status(500).send({
            statusCode: 500,
            status: false,
            message: err.message,
            data: [],
          });
        });
    })
    .catch((err) => {
      res.status(500).send({
        statusCode: 500,
        status: false,
        message: err.message,
        data: [],
      });
    });
};

const isVendor = (req, res, next) => {
  User.findByPk(req.userId)
    .then((users) => {
      if (!users) {
        res.status(403).send({
          statusCode: 403,
          status: false,
          message: "User Not Found",
          data: [],
        });
        return;
      }
      UserRole.findOne({
        where: { userid: req.userId },
      })
        .then((userrole) => {
          if (!userrole) {
            res.status(403).send({
              statusCode: 403,
              status: false,
              message: "Role not found",
              data: [],
            });
            return;
          }

          Role.findOne({
            where: { id: userrole.roleid },
          })
            .then((roles) => {
              if (!roles) {
                res.status(403).send({
                  statusCode: 403,
                  status: false,
                  message: "Require Vendor Role!",
                  data: [],
                });
                return;
              }
              if (roles.name == "vendor") {
                req.email = users.email;
                req.email_link = users.verify_email;
                next();
              } else {
                res.status(403).send({
                  statusCode: 403,
                  status: false,
                  message: "Role mis-matched",
                  data: [],
                });
                return;
              }
            })
            .catch((err) => {
              res.status(500).send({
                statusCode: 500,
                status: false,
                message: err.message,
                data: [],
              });
            });
        })
        .catch((err) => {
          res.status(500).send({
            statusCode: 500,
            status: false,
            message: err.message,
            data: [],
          });
        });
    })
    .catch((err) => {
      res.status(500).send({
        statusCode: 500,
        status: false,
        message: err.message,
        data: [],
      });
    });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isWocman: isWocman,
  isCustomer: isCustomer,
  isVendor: isVendor,
};
module.exports = authJwt;
