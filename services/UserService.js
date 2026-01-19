const UserModel = require("../model/UserModel");

const UserService = {
    addUser: (username, password, age, avatar) => {
        // 2. 统一使用 await 处理异步，不再混合 .then()，代码更清晰
        return UserModel.create({
            username,
            password,
            age: age || 0, // 给age设置默认值，避免插入null
            avatar
        });
    },
    updateUser: (_id, username, password, age) => {
        return UserModel.updateOne(
            { _id },
            // 2. 最好加 $set 操作符（Mongoose 6.x 虽可省略，但显式写更规范）
            { $set: { username, password, age } }
        );
    },
    deleteUser: (_id) => {
        return UserModel.deleteOne({ _id })
    },
    getUsers: async (condition, sort, page, pageSize) => {
        const total = await UserModel.countDocuments(condition)
        const list = await UserModel.find(condition)
            .sort(sort)          // 排序（-字段=降序，字段=升序，如 'age' 按年龄升序）
            .skip((page - 1) * pageSize)  // 跳过前面的条数（分页核心）
            .limit(Number(pageSize))     // 限制每页条数
            .select('-password -__v');     // 排除__v字段（-字段名 表示排除该字段，多个字段用空格分隔）
        return { total, list }
    },
    login: (username, password) => {
        // find({}) 该方法参数是一个对象类型 {} 
        return UserModel.find({ username, password })
    }
}

module.exports = UserService