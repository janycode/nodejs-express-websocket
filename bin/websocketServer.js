// websocket响应
const WebSocket = require("ws");
const JWT = require("../util/JWT");
const wss = new WebSocket.WebSocketServer({ port: 8080 });
// 监听默认事件 connection，不可修改，修改没什么用
wss.on('connection', function connection(ws, req) {
    console.log("req.url->", req.url);
    const reqUrl = new URL(req.url, "http://127.0.0.1:3000")
    const payload = JWT.verify(reqUrl.searchParams.get("token"))
    if (payload) {
        console.log("success:", payload);
        ws.user = payload  // .user 是新挂上 ws 的属性
        ws.send(createMessage(WebSocketType.GroupChat, ws.user, "欢迎来到聊天室-群聊开始..."))
        // 群发：用户上线时，群发一下用户列表
        sendTo(WebSocketType.GroupList, ws.user, Array.from(wss.clients).map(item => item.user))
    } else {
        console.log("未授权");
        ws.send(createMessage(WebSocketType.Error, null, "未授权！"))
    }

    ws.on('error', console.error);
    ws.on('message', function message(data) {
        // console.log('received: %s', data);
        const msgObj = JSON.parse(data)
        switch (msgObj.type) {
            case WebSocketType.GroupList:
                //console.log(Array.from(wss.clients).map(item => item.user)); //wss.clients中有 user{} 对象
                // 在线用户列表
                sendTo(WebSocketType.GroupList, ws.user, Array.from(wss.clients).map(item => item.user))
                console.log("发送用户列表 success ->", userList);
                break;
            case WebSocketType.GroupChat:
                console.log(msgObj.data);
                sendTo(WebSocketType.GroupChat, ws.user, msgObj.data)
                break;
            case WebSocketType.SingleChat:
                sendTo(WebSocketType.SingleChat, ws.user, msgObj.data, msgObj.to)
                break;
            case WebSocketType.Error:
                break;
            default:
                break;
        }
    });

    ws.on("close", () => {
        wss.clients.delete(ws.user)
        console.log("close:", ws.user);
    })

    //ws.send('欢迎来到聊天室！');
});

const WebSocketType = {
    Error: 0,     //错误
    GroupList: 1, //获取在线用户列表
    GroupChat: 2, //群聊
    SingleChat: 3 //私聊
}

function createMessage(type, user, data) {
    return JSON.stringify({
        type, user, data
    })
}

function sendTo(type, user, data, to) {
    // Server broadcast：转发给其他人(广播)
    wss.clients.forEach(function each(client) {
        let condition = client.readyState === WebSocket.OPEN
        if (to) {
            //私聊，添加到发送消息条件上
            condition = condition && (client.user.username === to)
        }
        if (condition) {
            client.send(createMessage(type, user, JSON.stringify(data)))
            console.log("广播消息:", type, user, data);
        }
    });
}