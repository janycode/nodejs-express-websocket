const mongoose = require("mongoose")
// 模型字段和类型限定
const Schema = mongoose.Schema
const UserType = {
    username: String,
    password: String,
    age: Number,
    avatar: String
}
// 模型 user 将会对应 users 集合
const UserModel = mongoose.model("user", new Schema(UserType))

module.exports = UserModel