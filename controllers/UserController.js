const UserService = require("../services/UserService");
const JWT = require("../util/JWT");

const UserController = {
    addUser: async (req, res) => {
        console.log("新增用户接收参数：", req.body);
        console.log("新增用户接收文件：", req.file); //批量上传是 req.files
        // 保留默认头像，头像业务上非必填
        const avatar = req.file ? `/uploads/${req.file.filename}` : `/images/default.jpg`
        const { username, password, age } = req.body;
        // 1. 先做参数校验（避免空值插入数据库）
        if (!username || !password) {
            return res.send({ err: -1, msg: "用户名和密码为必填项" });
        }
        try {
            const createResult = await UserService.addUser(username, password, age, avatar)
            // 3. 打印详细的新增结果，便于排查
            console.log("用户新增成功：", createResult);
            // 4. 返回新增成功的标识 + 新增的用户数据（含自动生成的_id）
            res.send({
                ok: 1,
                msg: "用户新增成功",
                data: createResult // 把新增的完整文档返回给前端
            });
        } catch (error) {
            // 5. 打印具体的错误信息，定位问题（比如字段验证失败、数据库连接问题）
            console.error("用户新增失败：", error);
            // 6. 返回具体的错误提示，而非仅返回 err:-1
            res.send({
                err: -1,
                msg: "用户新增失败",
                error: error.message // 把错误信息返回（生产环境可酌情隐藏）
            });
        }
    },
    updateUser: async (req, res) => {
        console.log(req.body, req.params.myid);
        const { username, password, age } = req.body;
        try {
            // 1. async 添加 await 等待更新操作完成，并接收结果
            const updateResult = await UserService.updateUser(req.params.myid, username, password, age)
            // 3. 验证更新是否真的生效（关键：检查匹配的文档数）
            if (updateResult.matchedCount === 0) {
                return res.send({ err: -1, msg: "未找到该用户（_id 不存在）" });
            }
            console.log("更新成功", updateResult);
            res.send({ ok: 1, data: updateResult });
        } catch (error) {
            console.error("更新失败：", error); // 打印具体错误信息
            res.send({ err: -1, msg: error.message });
        }
    },
    deleteUser: async (req, res) => {
        console.log(req.params.myid);
        try {
            const deleteResult = await UserService.deleteUser(req.params.myid);
            if (deleteResult.matchedCount === 0) {
                return res.send({ err: -1, msg: "未找到该用户（_id 不存在）" });
            }
            console.log("删除成功", deleteResult);
            res.send({ ok: 1, data: deleteResult });
        } catch (error) {
            console.error("删除失败：", error); // 打印具体错误信息
            res.send({ err: -1, msg: error.message });
        }
    },
    getUsers: async (req, res) => {
        // 1. 获取前端传入的查询参数（解构+设置默认值，避免参数缺失报错）
        const {
            page = 1,        // 当前页码，默认第1页
            pageSize = 10,   // 每页条数，默认10条
            username = '',   // 按用户名模糊查询，默认查全部
            age = '',        // 按年龄精准查询，默认查全部
            sort = '-_id'    // 排序规则，默认按_id降序（最新新增的在前）
        } = req.query;

        try {
            // 2. 构建查询条件（支持模糊/精准筛选）
            const queryCondition = {};
            // 用户名模糊查询（不区分大小写）
            if (username) {
                queryCondition.username = { $regex: username, $options: 'i' };
            }
            // 年龄精准查询（需确保age是数字）
            if (age) {
                queryCondition.age = Number(age);
            }

            // 3. 执行分页查询（countDocuments统计总数，find查列表，skip+limit分页）
            // 先统计符合条件的总条数（用于计算总页数）再查询当前页的数据
            const { total, list } = await UserService.getUsers(queryCondition, sort, page, pageSize)

            // 4. 打印日志，便于排查
            console.log(`用户列表查询成功：页码${page}，条数${list.length}，总条数${total}`);

            // 5. 返回完整的列表数据（含分页信息）
            res.send({
                ok: 1,
                msg: "用户列表查询成功",
                data: {
                    list,           // 当前页数据列表
                    pagination: {
                        page: Number(page),
                        pageSize: Number(pageSize),
                        total,        // 总条数
                        totalPage: Math.ceil(total / pageSize) // 总页数
                    }
                }
            });
        } catch (error) {
            // 6. 捕获错误并返回详细信息
            console.error("用户列表查询失败：", error);
            res.send({
                err: -1,
                msg: "用户列表查询失败",
                error: error.message
            });
        }
    },
    login: async (req, res) => {
        const { username, password } = req.body
        const data = await UserService.login(username, password)
        if (data.length === 0) {
            // 未查询到
            res.send({ ok: -1 })
        } else {
            // session: 3.设置 session 对象，默认存储在内存中
            //req.session.user = data[0] // 挂一个 user 字段，内容是用户信息

            // jwt: 1.使用 jwt 生成 token，并返回到 header 中
            const token = JWT.generate({
                _id: data[0]._id,
                username: data[0].username
            }, "1h")
            res.header("Authorization", token)
            res.send({ ok: 1 })
        }
    },
    logout: async (req, res) => {
        // session: 销毁 session 在退出登陆时
        req.session.destroy(() => {
            res.send({ ok: 1 })
        })
    }
}

module.exports = UserController