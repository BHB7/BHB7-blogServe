const express = require('express');
const createError = require('http-errors');
// 解析jwt
const { expressjwt } = require('express-jwt')
const path = require('path');
const { User } = require('./models/index');
const articlesRouter = require('./routes/articles');
const usersRouter = require('./routes/users');
const commentsRouter = require('./routes/comments');
const cosRouter = require('./routes/cos')
const morgan = require('morgan');

const app = express();
app.use(morgan('dev'))
app.set('view engine', null); // 或者 app.set('view engine', 'none');

// 设置跨域请求头
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.header.origin || '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', true);
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// JWT 验证中间件
const jwtMiddleware = expressjwt({
  secret: 'test12345',
  algorithms: ['HS256'],
}).unless({
  path: [
    '/api/users/login',
    '/api/users/reg',
    '/api/upload',
    '/api/articles',
    '/api/getKeyAndCredentials',
    /^\/images\/\w+/,
    /^\/api\/comments\/articles\/hot\/\w+/,
    /^\/api\/comments\/articles\/new\/\w+/,
    /^\/api\/articles\/users\/\w+/,
    { url: /^\/api\/articles\/\w+/,methods:['GET']}
  ]
});
app.use(jwtMiddleware);

// 处理静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 路由处理程序
app.use('/api/articles', articlesRouter);
app.use('/api/users', usersRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/getKeyAndCredentials', cosRouter )

// 错误处理程序
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ code: 0, msg: '无效的token或没有传递token,请重新登录' });
  } else {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
  }
});

module.exports = app;
