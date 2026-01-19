var express = require('express');
const UserController = require('../controllers/UserController');
var router = express.Router();
// multer: 1.引入 multer
const multer = require('multer')
const upload = multer({ dest: 'public/uploads/' })

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// 新增-POST
// multer: 2.添加 single 指定 文件名，前后端一致（批量上传用 upload.array('avatars', 10) 10-最多接收10张）
/**
 * 
 * @api {post} /user 添加用户
 * @apiName addUser
 * @apiGroup 用户接口
 * @apiVersion  1.0.0
 * 
 * 
 * @apiParam  {String} username 用户名
 * @apiParam  {String} password 密码
 * @apiParam  {Number} age 年龄
 * @apiParam  {File} avatar 头像
 * 
 * @apiSuccess (200) {Number} ok 标识成功字段
 * 
 * @apiParamExample  {type} Request-Example:
 * {
 *     username : "jerry",
 *     password : "123456",
 *     age : 22,
 *     avatar : File
 * }
 * 
 * 
 * @apiSuccessExample {type} Success-Response:
 * {
 *     ok : 1
 * }
 * 
 * 
 */
router.post('/user', upload.single("avatar"), UserController.addUser);

// 更新-PUT
router.put('/user/:myid', UserController.updateUser);

// 删除-DELETE
/**
 * 
 * @api {delete} /user/:myid 删除用户
 * @apiName deleteUser
 * @apiGroup 用户接口
 * @apiVersion  1.0.0
 * 
 * 
 * @apiParam  {String} myid 用户主键_id
 * 
 * @apiSuccess (200) {Number} ok 成功与否标识
 * 
 * @apiParamExample  {String} Request-Example:
 * {
 *     myid : abc123
 * }
 * 
 * 
 * @apiSuccessExample {type} Success-Response:
 * {
 *     ok : 1
 * }
 * 
 * 
 */
router.delete('/user/:myid', UserController.deleteUser);

// 列表-GET
router.get('/user', UserController.getUsers);

// 登陆与退出登陆校验
router.post("/login", UserController.login);
router.get("/logout", UserController.logout);

module.exports = router;
