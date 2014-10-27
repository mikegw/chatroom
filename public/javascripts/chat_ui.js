(function() {
  console.log("starting chat_ui")

  if(!(typeof window.Chat)) {
    window.Chat = function () {};
  }

  var ChatUI = window.ChatUI = function () {
    console.log("called new chat_ui");

    this.initialize = function() {
      console.log("initialized");
      this.chatSocket = io()
      console.log("chatSocket", this.chatSocket)

      this.chat = new Chat(this.chatSocket);

      this.$newMessage = $(".new-message");
      this.$msgDisplay = $(".message-display ul");
      this.$notifications = $(".notifications ul");

      console.log("message form:", this.$newMessage)

      this.$newMessage.on("submit", this.sendMessage.bind(this))

      this.chatSocket.on("message", this.receiveMessage.bind(this))
      this.chatSocket.on("nicknameChangeResult", this.nameChange.bind(this))
    };

    this.getMessage = function () {
      var parsedForm = this.$newMessage.serializeJSON();
      console.log("got message:", parsedForm);

      return parsedForm.message;
    };

    this.sendMessage = function (event) {
      event.preventDefault();
      console.log('sending message')
      var msg = this.makeSafe(this.getMessage());
      this.$newMessage.find("#message-text").val('');

      var msgStatus = this.chat.sendMessage(msg);

      if(!msgStatus.success){
        var $msgError = $('<li class="error">' + msgStatus.error + "</li>")

        this.notify($msgError);

      } else if(msgStatus.notification) {
        var $msgNotification =
          $('<li class="notification">' + msgStatus.notification + "</li>")

          this.notify($msgNotification);
      } // else {
//         this.addToDisplay(msg);
      // }
    };

    // this.addToDisplay = function (msg) {
    //   this.$msgDisplay.append(msg);
    //   this.$newMessage.find("#message-text").val('');
    // };

    this.notify = function ($msg) {
      this.$notifications.append($msg);
      console.log("notifications:", this.$notifications)

      setTimeout(function () {
        this.$notifications.first().remove()
      }.bind(this), 3000);
    };

    this.receiveMessage = function(msg) {
      console.log("received", msg)
      $toDisplay = "<li>" + "(" + this.time() + ")  " + msg.guestName + ": " + msg.text + "</li>"
      this.$msgDisplay.append($toDisplay);
    };

    this.nameChange = function (change) {
      if(change.success) {
        console.log("nameChange", change);
        $toDisplay = '<li class="event">' + change.oldName + ' is now ' + change.newName + "</li>";
        this.$msgDisplay.append($toDisplay);
      } else {
        console.log("nameChange", change, "failed!");
      }
    }

    this.makeSafe = function(text) {
      return text.replace("<", "%3C").replace(">", "%3E");
    }

    this.time = function() {
      date = new Date();
      return date.getHours() + ":" + date.getMinutes();
    }

    this.initialize();

  };

  $(document).ready(function () {
    window.chatUI = new ChatUI();
  });

})();