var express = require('express');
var router = express.Router();

/* 首页数据 */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
