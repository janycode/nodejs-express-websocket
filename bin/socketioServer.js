const JWT = require('../util/JWT');

// socket.io响应
function start(server) {
    const io = require('socket.io')(server)
    io.on('connection', (socket) => {
        console.log("connection success  111", socket.handshake.query.token);
        // token解析
        const payload = JWT.verify(socket.handshake.query.token)
        if (payload) {
            socket.user = payload
            //发送欢迎
            socket.emit(WebSocketType.GroupChat, createMessage(socket.user, "欢迎来到聊天室"))
            //给所有发送用户列表(实时获取)
            sendAll(io, socket.user)
        } else {
            socket.emit(WebSocketType.Error, createMessage(socket.user, "token过期，未授权"))
        }

        socket.on(WebSocketType.GroupList, () => {
            // 用户列表需要实时获取
            console.log("sockets user:", Array.from(io.sockets.sockets).map(item => item[1].user))
            sendAll(io, socket.user)
        })
        socket.on(WebSocketType.GroupChat, (msg) => {
            console.log("群聊：", msg);
            console.log("群聊 data：", JSON.parse(msg).data);
            //给所有人发
            // io.sockets.emit(WebSocketType.GroupChat, createMessage(socket.user, msg.data))
            //除了自己不发，其他人发
            socket.broadcast.emit(WebSocketType.GroupChat, createMessage(socket.user, JSON.parse(msg).data))
        })
        socket.on(WebSocketType.SingleChat, (msg) => {
            const msgObj = JSON.parse(msg)
            Array.from(io.sockets.sockets).forEach(item => {
                if (item[1].user.username === msgObj.to) {
                    item[1].emit(WebSocketType.SingleChat, createMessage(socket.user, msgObj.data))
                }
            })
        })

        socket.on('disconnect', () => {
            sendAll(io, socket.user)
        });
    });
}

const WebSocketType = {
    Error: 0,     //错误
    GroupList: 1, //获取在线用户列表
    GroupChat: 2, //群聊
    SingleChat: 3 //私聊
}

function createMessage(user, data) {
    return JSON.stringify({
        user, data
    })
}

function sendAll(io, user) {
    const userList = Array.from(io.sockets.sockets).map(item => item[1].user).filter(item => item)
    io.sockets.emit(WebSocketType.GroupList, createMessage(user, userList))
}

module.exports = start