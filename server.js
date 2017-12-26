var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    //  //引入socket.io模块并绑定到服务器
    io = require('socket.io').listen(server),
    users = [];//保存所有在线用户昵称
app.use('/', express.static(__dirname + '/www'));
//
server.listen(process.env.PORT || 8888);
io.sockets.on('connection', function(socket) {
    //设置昵称
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            //socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            // 向所有连接到服务器的客户端发送当前登陆用户的昵称
            io.sockets.emit('system', nickname, users.length, 'login');
        };
    });
    //断开连接的事件
    socket.on('disconnect', function() {
        if (socket.nickname != null) {
            ////将断开连接的用户从users中删除
            users.splice(users.indexOf(socket.nickname), 1);
                //通知除自己以外的所有人
            socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
        }
    });
    //接收新消息
    socket.on('postMsg', function(msg, color) {
      //将消息发送到除自己外的所有用户
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });
    //接收
    socket.on('img', function(imgData, color) {
      // 通过一个newImg事件分发到除自己外的每个用户
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });
});
