var express = require('express');
const JWT = require('../util/JWT');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('upload', { title: 'Express' });
});

module.exports = router;
