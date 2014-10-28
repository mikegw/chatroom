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
      this.$style = $("style");


      console.log("message form:", this.$newMessage)

      this.$newMessage.on("submit", this.sendMessage.bind(this))

      this.chatSocket.on("message", this.receiveMessage.bind(this))
      this.chatSocket.on("nicknameChangeResult", this.nameChange.bind(this))
      this.chatSocket.on("recent", (function (event) {
        console.log("event", event)
        for(msg in event.messages){
          console.log(msg)
          this.receiveMessage(msg)
        }
      }).bind(this))
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
        this.$notifications.find("li").first().remove()
      }.bind(this), 3000);
    };

    this.receiveMessage = function(msg) {
      console.log("received", msg)

      var toDisplay =  '<li>';
      toDisplay += '<feature class="img-container">';
      toDisplay +=   '<img class="sprite' + msg.userId + '" src="pokemon.png" width="1200" height="960" alt="Pokemon">'
      toDisplay += '</feature>';
      toDisplay +=   '<span class="user-name">' + msg.guestName + ':' +'</span>';
      toDisplay +=   '<span class="text">' + msg.text + '</span>';
      toDisplay +=   '<span class="time">' + this.time() + '</span>';
      toDisplay += '</li>';

      this.$style.append(
        ".sprite" + msg.userId +
        " {position: absolute; top: -" +
        (48 * Math.floor(msg.userId / 25)) +
        "px; left: -" +
        (48 * (msg.userId % 25)) +
        "px;}");
      this.addToScreen(toDisplay);

    };

    this.nameChange = function (change) {
      if(change.success) {
        console.log("nameChange", change);
        toDisplay = '<li class="event">' + change.oldName + ' is now ' + change.newName + "</li>";
        this.addToScreen(toDisplay);
      } else {
        var $msgError = $('<li class="error">' + change.message + "</li>")

        this.notify($msgError);
      }
    }

    this.makeSafe = function(text) {
      return text.replace("<", "%3C").replace(">", "%3E");
    }

    this.time = function() {
      date = new Date();
      return this.pad(date.getHours(), 2) + ":" + this.pad(date.getMinutes(), 2);
    }

    this.pad = function(num, digits) {
      return (Array(digits + 1).join("0") + num).slice(-digits);
    };

    this.addToScreen = function (message) {
      this.$msgDisplay.append(message);
      $(".message-display")[0].scrollTop = $(".message-display")[0].scrollHeight;
    };

    this.initialize();

  };

  $(document).ready(function () {
    window.chatUI = new ChatUI();
  });

})();