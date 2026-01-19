var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// session: 1.引入 express-session 模块
var session = require('express-session')
// mongo存储session: 1.安装 npm i connect-mongo@4.6.0, 支持 session 存储到 mongo
const MongoStore = require("connect-mongo");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var uploadRouter = require('./routes/upload');
var chatRouter = require('./routes/chat');
const JWT = require('./util/JWT');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session: 2.注册 session 中间件
app.use(session({
  name: 'jerry-system',          // [可选]给 session 系统命名
  secret: 'hello123world456',    // 自定义服务器生成 session 的签名
  cookie: {
    maxAge: 1000 * 60 * 60,      // 过期时间：1h
    secure: false                // true-限制为 https，false-可用于 http
  },
  resave: true,                  // 接口被访问且重新设置 session 后会重新计时
  saveUninitialized: true,       // 第一次访问就会给浏览器 cookie 值
  rolling: true,                 // 默认为 true-超时前刷新，cookie 会重新计时；false-超时前刷新都是按第一次刷新开始计时
  // mongo存储session: 2.设置 session 的 store 属性
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/jerry_session',  //会新创建一个数据库，即 Collection
    ttl: 1000 * 60 * 10           // 与 cookie 过期时间要保持一致！
  })
}))

// session: 3.设置 session 中间件，用于过期校验拦截路由和接口
// app.use((req, res, next) => {
//   // 排除 login 相关的路由和接口
//   if (req.url.includes("login")) {
//     next()
//     return
//   }

//   if (req.session.user) {
//     // 重新设置 session 让过期时间重新计时，自定义一个字段即可，比如用时间戳
//     req.session.mydate = Date.now()
//     next() //进入下方的路由中间件
//   } else {
//     // 接口：返回错误码-页面ejs做重定向, 路由：重定向
//     req.url.includes("api") ? res.status(401).json({ ok: -1 }) : res.redirect("/login")
//   }
// })

// jwt: 2.token 的后端校验
app.use((req, res, next) => {
  // 排除 login 相关的路由和接口
  if (req.url.includes("login")) {
    next()
    return
  }
  // 从 header 中解析 token
  const token = req.headers["authorization"]?.split(" ")[1]
  console.log(req.headers["authorization"]); //Bearer null (都会进if分支)
  if (token) {
    const payload = JWT.verify(token)
    console.log("当前登录用户: ", payload);
    if (payload) {
      //每次访问时，在有效期内，重新计算有效期，即续期（否则有效期就是一次性的）
      const newToken = JWT.generate({
        _id: payload._id,
        username: payload.username
      }, "1h")
      res.header("Authorization", newToken)

      next()
    } else {
      res.status(401).send({ errCode: -1, errMessage: "token过期" })
    }
  } else {
    next()
  }
})

app.use('/', indexRouter);
app.use('/api', usersRouter);
app.use('/login', loginRouter);
app.use('/upload', uploadRouter);
app.use('/chat', chatRouter);
app.use('/apidoc', express.static('apidoc'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
