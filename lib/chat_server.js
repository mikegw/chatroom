var Chat = function (server) {
  this.chatServer = require('socket.io')(server);
  this.nicknames = {};
  this.userIds = {};
  this.guestNumber = 1;
  this.recent = [];

  this.chatServer.on('connection', (function (socket) {
    this.newGuest(socket);
    this.chatServer.emit('message', {
      guestName: "Host",
      text: 'Welcome, ' + this.nicknames[socket.id] + '!' });
    console.log("hello");

    this.chatServer.emit('recent', {
      messages: this.recent
    });

    socket.on('message', (function (msg) {
      console.log("server received", msg, "from", this.nicknames[socket.id], " socket", socket.id)

      var response = {
        guestName: this.nicknames[socket.id],
        userId: this.userIds[socket.id],
        text: msg.text
      }

      this.recent.push(response);
      if (this.recent.length > 30) this.recent.slice(30);
      this.chatServer.emit('message', response)
    }).bind(this));

    socket.on('nicknameChangeRequest', (function(req){
      console.log("nickname request", req);
      this.changeNickName(req, socket);
    }).bind(this))

  }).bind(this));
};

Chat.prototype.newGuest = function (socket) {
  this.nicknames[socket.id] = 'guest' + this.pad(this.guestNumber, 4);
  this.userIds[socket.id] = this.guestNumber * 16;
  this.guestNumber += 1;
  this.chatServer.emit('newUser', {
    nickname: this.nicknames[socket.id],
    userId: this.userIds[socket.id]
  });
};

Chat.prototype.pad = function(num, digits) {
  return (Array(digits + 1).join("0") + num).slice(-digits);
};

Chat.prototype.changeNickName = function(req, socket) {
  var newName = req.newName;
  var old = this.nicknames[socket.id]
  var taken = false;


  if(!req.forced) {
    if(newName.slice(5) === "guest"){
      this.complain("Names cannot begin with guest", socket);
      return false;
    }

    for (var key in this.nicknames) {
      if(this.nicknames[key] === newName){
        taken = true;
      }
    }

    if(taken){
      this.complain("Name taken", socket);
      return false;
    }

    this.nicknames[socket.id] = newName;
    socket.emit('nicknameChangeResult', {
      success: true,
      oldName: old,
      newName: this.nicknames[socket.id]
    })
    return true;
  } else {
    for (var key in this.nicknames) {
      if(this.nicknames[key] === newName){
        this.nicknames[key] = 'guest' + this.pad(this.guestNumber, 4);
        this.guestNumber += 1;
      }
    }

    this.nicknames[socket.id] = newName;
    socket.emit('nicknameChangeResult', {
      success: true,
      oldName: old,
      newName: this.nicknames[socket.id]
    })
  }
};

Chat.prototype.complain = function (msg, socket) {
  socket.emit('nicknameChangeResult', {
    success: false,
    message: msg
  });
};

console.log(Chat);

module.exports = Chat;
