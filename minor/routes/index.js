var express = require('express');
var router = express.Router();

/*Get login page*/
router.get('/', (req, res, next) => {
    res.render('index')
})

router.get('/home', (req, res, next) => {
    res.render('home')
})

router.get('/about', (req, res, next) => {
    res.render('about-us')
})

router.get('/tracking', (req, res, next) => {
    res.render('tracking')
})

router.get('/contact', (req, res, next) => {
    res.render('contact-us')
})

router.get('/doctor_details', (req, res, next) => {
    res.render('doctor_details')
})

router.get('/quote', (req, res, next) => {
    res.render('quote')
})

module.export = router;