// 导入 mongodb 数据库支持库，需要安装依赖 npm i mongoose
const mongoose = require("mongoose")
// 连接数据库: 插入集合和数据时，数据库 jerry_project 会自动创建
mongoose.connect("mongodb://127.0.0.1:27017/jerry_project")
// 消除 strictQuery 警告(提前适配 Mongoose 7.x 行为, 7.x仅适配mongo4.2+版本)
mongoose.set('strictQuery', false)