function DomElementUser(uid, element) {
	this.uid = uid;
	this.user;
	this.element = element;

	this.downCb;
	this.upCb;
	this.msgCb;

	this.receive = function(msg) {

		setTimeout(function() {
			console.log("Sending msg down the socket: " + this.uid);
			if (this.msgCb) this.msgCb(msg);
		}.bind(this), 0)
		
	}
	this.send = function(msg) {
		this.element.find('.msgUL').append('<li>' + JSON.stringify(msg) + '</li>');
		
	}
	this.setUID = function(uid) {
		this.uid = uid;
	}
	this.setElement = function(element) {
		this.element = element;
	}
	this.setUser = function(user) {
		this.user = user;
	}
	this.onConnectionDown = function(cb) {
		this.downCb = cb;
	}
	this.onConnectionUp = function(cb) {
		this.upCb = cb;
	}
	this.onMessage = function(cb) {
		this.msgCb = cb;
	}
}

module.exports = DomElementUser;