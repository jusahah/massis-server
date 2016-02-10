
// Meant only for Socket.io sockets
function SocketWrapper(websocket) {
	this.ws = websocket;

	this.downCb;
	this.upCb;
	this.msgCb;


	this.init();

}


SocketWrapper.prototype.onConnectionDown = function(cb) {
	this.downCb = cb;
}

SocketWrapper.prototype.onMessage = function(cb) {
	this.msgCb = cb;
};

SocketWrapper.prototype.onConnectionUp = function(cb) {
	this.upCb = cb;
};

SocketWrapper.prototype.init = function() {
	//this.ws.on('disconnect', this.socketDisconnect.bind(this));
	this.ws.on('fromClient', this.receive.bind(this));
}

SocketWrapper.prototype.socketDown = function() {
	if (this.downCb) this.downCb();
}
SocketWrapper.prototype.socketConnect = function() {
	if (this.upCb) this.upCb();
};
SocketWrapper.prototype.receive = function(msg) {
	// All messages from clients come through here
	if (this.msgCb) this.msgCb(msg);
};

SocketWrapper.prototype.send = function(msg) {
	// All messages to client go through here
	this.ws.emit('fromServer', msg);
}

module.exports = SocketWrapper;