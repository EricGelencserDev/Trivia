const SocketApp = require('../socket-app');

let messageId = 0;
let userId = 0;
let users = {};

class Chat extends SocketApp {
  constructor(io, connectionName) {
    super(io, connectionName);
    this.io = io;
  }

  onConnect(socket) {
    let _this = this
    let interval = 1000;
    let messageCount = 10;
    let timer = null;

    socket.on('signin', (username) => {
      users[socket.id] = {
        username: username,
        userId: userId++
      };
      let userList = {};
      Object.keys(users).forEach(id => {
        userList[users[id].userId] = {
          username: users[id].username,
          userId: users[id].userId
        }
      })
      _this.server.emit('userlist', userList);
    })

    socket.on('disconnect', () => {
      delete users[socket.id];
      _this.server.emit('userlist', Object.keys(users).map(id => {
        return users[id]
      }));
    })

    socket.on('send', (message) => {
      message.id = messageId++;
      message.userId = users[socket.id].userId;
      message.timeStamp = new Date().getTime();
      _this.server.emit('new-message', message);
    })

    socket.on('typing', (data) => {
      socket.broadcast.emit('typing', users[socket.id]);
    })
  }
}



module.exports = Chat;
