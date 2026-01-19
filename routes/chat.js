var express = require('express');
var router = express.Router();

/* Get login page. */
router.get('/', function (req, res, next) {
    // res.render('chat', { title: 'Express' });
    res.render('chat_socketio', { title: 'Express' });
});

module.exports = router;
