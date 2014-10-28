(function () {

  var Chat = window.Chat = function (socket) {
    this.socket = socket;

    this.sendMessage = function (msg) {
      if (msg[0] === "/") {
        return this.handle(msg);
      } else {
        console.log("client sending message:", msg)
        this.socket.emit('message', {text: msg});
        return {
          success: true
        };
      }
    };

    this.handle = function (msg) {
      var task = msg.split(" ");
      if(task.length > 2) {
        return {
          success: false,
          error: "Invalid Command: Can't use spaces!"
        };
      } else {
        console.log("tried to perform task:", task)
        switch(task[0]){
        case "/nick":
          console.log("tried to change nickname to", task[1]);
          this.socket.emit("nicknameChangeRequest", {newName: task[1]});
          return {
            success: true,
            notification: "Changing nickname to " + task[1] + "..."
          };
        case "/steal":
          console.log("tried to change nickname to", task[1]);
          this.socket.emit("nicknameChangeRequest", {newName: task[1], forced: true});
          return {
            success: true,
            notification: "Changing nickname to " + task[1] + "..."
          };
        default:
          return {
            success: false,
            error: "Unknown Command"
          };
        }
      }
    };

  };

})();