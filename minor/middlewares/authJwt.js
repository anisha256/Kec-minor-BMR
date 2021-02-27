const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const User = require('../models/User');

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  User.findById(req.loginId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if(user.roles !== 'Admin') {
      return res.status(403).json({message: 'Unauthorized!'})
    }

    return next();
  });
};

isDoctor = (req, res, next) => {
  User.findById(req.loginId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if(user.roles !== 'Doctor') {
      return res.status(403).json({message: 'Unauthorized!'})
    }

    return next();
  });
};

const authJwt = {
  verifyToken,
  isAdmin,
  isDoctor
};
module.exports = authJwt;