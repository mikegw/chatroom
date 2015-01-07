var http = require('http');
var static = require('node-static');
var Chat = require('./chat_server');
var port = process.env.PORT || 8001;

console.log(require('./chat_server'));

var file = new static.Server('./public');

var server = http.createServer(function (req, res) {
  req.addListener('end', function () {
    file.serve(req, res);
  }).resume();
});

server.listen(port);

var chat = new Chat(server);
