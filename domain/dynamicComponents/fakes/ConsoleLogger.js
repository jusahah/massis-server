function ConsoleLogger(uid) {
	this.uid = uid;
	this.send = function(msg) {
		console.log("User " + this.uid + ": " + JSON.stringify(msg));
	}
	this.setUID = function(uid) {
		this.uid = uid;
	}
}

module.exports = ConsoleLogger;