const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

let users = [];

io.on('connection', (socket) => {
	//当前登陆用户
	let userName = null;

	//进入
	socket.on('login', (uname) => {
		//是否新用户标识
		let isNew = true;
		for (let i = 0; i < users.length; i++) {
			if (users[i].user_name == uname.user_name) {
				isNew = false;
				break;
			} else {
				isNew = true;
			}
		}
		if (isNew) {
			userName = uname.user_name;
			users.push({
				user_name: userName
			})
			//登陆成功
			socket.emit('loginSuccess', uname);
			//广播add
			io.sockets.emit('add', uname);
		} else {
			socket.emit('loginFalse', '');
		}
	});

	//退出
	socket.on('disconnect', () => {
		io.sockets.emit('leave', userName);
		users.map((val,index) => {
			if (val.user_name == userName) {
				users.splice(index, 1);
			}
		})
	});

	//消息
	socket.on("sendMsg", (data) => {
		data.id = userName;
		io.sockets.emit("receiveMsg", data);
	});
});

http.listen(3000, () => {
	console.log('listening on localtion:3000');
});