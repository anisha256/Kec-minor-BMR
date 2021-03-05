// Imports
const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const blockchainController = require('./controllers/blockchainController');
const responseController = require('./controllers/responseController');
const { verifySignUp } = require("./middlewares");
const logincontroller = require("./controllers/auth.controller");
const reportController = require("./controllers/reportController")
const { enrollAdmin } = require('./controllers/blockchainController')
const checkAuth = require("./middlewares/check-auth")
const port = process.env.PORT || 3000;

const cors = require("cors");
var corsOptions = {
  origin: "http://localhost:8081"
};


// require("./db/conn");
var User = require('./models/User');


// Static Files
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// set views
app.set('views', './views')
app.set('view engine', 'ejs')

//Db connection start
mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


mongoose.connection.on('error', (err) => {
  console.error('Mongo failed to connect');
});
enrollAdmin();

app.post('/signup',
  [
    verifySignUp.checkDuplicateUsernameOrEmail
  ],
  blockchainController.registerAndEnrollUser,
  responseController.ca,
);

app.post("/signin",
  logincontroller.signin
);
app.post("/signindoctor",
  logincontroller.signindoctor
)
app.get('/', (req, res) => {
  res.render('index')
})
app.get('/doctor', (req, res) => {
  res.render('indexdoctor')
})
app.get('/home', (req, res) => {
  res.render('home')
})

app.get('/homedoctor', (req, res) => {
  res.render('homedoctor')
})

app.get('/about', (req, res) => {
  res.render('about-us')
})

app.get('/tracking', (req, res) => {
  res.render('tracking')
})

app.get('/contact', (req, res) => {
  res.render('contact-us')
  req.session.destroy()
})

app.get('/view_doctor', (req, res) => {
  res.render('view_doctor')
})

app.get('/doctor_details', (req, res) => {
  res.render('doctor_details')
})

app.get('/quotedoctor', (req, res) => {
  res.render('quotedoctor')
})

app.get('/quote', (req, res) => {
  var token = req.headers.token;
  console.log(token)
  res.render('quote', {
    data: {},

  })

})
app.get('/doctor_entry', (req, res) => {
  res.render('form', {
    data: {}
  })
})

app.post('/doctor_entry', function (req, res) {
  res.render('form', {
    data: req.body
  })
  console.log(req.body.doctorName)
  var user = new Doctor({
    doctorName: req.body.doctorName,
    NMCNumber: req.body.NMCNumber,
    //hospitalName: res.body.hospitalName,
    qualification: req.body.qualification,
    speciality: req.body.speciality,

  })
  var promise = doctor.save()
  promise.then((doctor) => {
    console.log("user saved", doctor)
  })

})
app.post('/quote',

  blockchainController.invokeChaincode,
  responseController.user
)

app.post('/quotedoctor',

  blockchainController.invokeChaincode,
  responseController.user
)

app.post('/find',
  reportController.getReportByID,
  blockchainController.queryChaincode,
  responseController.user

)
app.post('/display',
  reportController.getReports,
  blockchainController.queryChaincode,
  responseController.user
)
app.post('/update',
  reportController.updateReportByID,
  blockchainController.invokeChaincode,
  responseController.user

)

app.post('/search', function (req, res) {
  console.log(req.body);
  User.find({ 'name': { $regex: req.body.name } })
    .then((data => {
      console.log(data[0].name)
      res.render('view_doctor', { data });
    })
    )
}
)
//Listen to port 3000
app.listen(port, () => console.info(`Listening on port ${port}`))