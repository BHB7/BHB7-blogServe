var express = require('express');
var router = express.Router();
const { User } = require('../models/index')
/* 注册请求 */
router.post('/reg', function (req, res, next) {
  let { username, password, nickname, headImgUrl } = req.body; // 将const改为let
  console.log(req.body);
  if (!headImgUrl) {
    headImgUrl = 'http://sm101.test.upcdn.net/img/%E9%BB%98%E8%AE%A4%E5%A4%B4%E5%83%8F.png';
  }
  if (username && password && nickname) {
    // 创建用户 
    User.create({ username, password, nickname, headImgUrl }) // 使用解构的方式传递对象
      .then(() => {
        res.json({
          code: 1,
          msg: '注册成功'
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          code: 0,
          msg: '注册失败',
          err: '用户名已存在'
        });
      });
  } else {
    res.json({
      code: 0,
      msg: '注册失败，缺少参数',
      err: '注册失败，缺少参数'
    });
  }
});

/* 登录请求*/
const jwt = require('jsonwebtoken')
router.post('/login', (req, res) => {
  const { username, password } = req.body
  console.log(username, password);
  User.findOne({ username: username, password: password }).then((r) => {
    console.log(r);
    if (r === null) {
      res.json({
        code: 0,
        msg: '登录失败',
        err: '用户名或密码错误'
      });
    } else {
      const token = jwt.sign({ username: username, uid: r._id }, 'test12345', { expiresIn: '30d', algorithm: 'HS256' })
      res.json({
        code: 1,
        msg: '登录成功',
        token: token,
        data: r
      });
    }
  }).catch(err => {
    console.error(err);
    res.json({
      code: 0,
      msg: '登录失败',
      err: err.message
    });
  })
})

module.exports = router;
