const config = require("../config/auth.config");

const User = require('../models/User');

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { user } = require("./responseController");


exports.signin = (req, res) => {
  console.log(req.body.email);
  User.findOne({

    email: req.body.email
  })
    .exec((err, login) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!login) {
        return res.render('404');
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        login.password
      );

      if (!passwordIsValid) {
        // return res.status(401).send({
        //   accessToken: null,
        //   message: "Invalid Password!"
        // });
        return res.render('404');
      }

      var token = jwt.sign({ id: login.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });
      // res.status(200).send({
      //   id: login._id,
      //   email: user.email,
      //   roles: authorities,
      //   accessToken: token
      // });
      res.render('home', { data: token });


    }
    )
}
