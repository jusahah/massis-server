
// Meant only for Socket.io sockets
function SocketWrapper(websocket) {
	this.ws = websocket;

	this.downCb;
	this.upCb;
	this.msgCb;

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
	this.ws.on('disconnect', this.socketDisconnect.bind(this));
	this.ws.on('msg', this.receive.bind(this));
}

SocketWrapper.prototype.socketDisconnect = function() {
	if (this.downCb) this.downCb();
}
SocketWrapper.prototype.socketConnect = function() {
	if (this.upCb) this.upCb();
};
SocketWrapper.prototype.receive = function(msg) {
	if (this.msgCb) this.msgCb(msg);
};

module.exports = SocketWrapper;