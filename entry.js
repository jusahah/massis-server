// Communication implementation is socket.io
var io = require('socket.io')();
var SocketWrapper = require('./technical/internet/SocketWrapper');
// Domain layer entry point
var controller = require('./domain/controller');

var SOCKET_PORT = 8079;


io.on('connection', function(socket) {
	var sw = new SocketWrapper(socket); // Inits socket listeners etc
	sw.
});

io.listen(SOCKET_PORT);



