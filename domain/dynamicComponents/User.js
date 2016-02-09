// NOTE
// User object lives in the domain layer!
// MsgMechanism lives in the technical layer!
function User(id, msgMechanism, tournamentID) {
	this.id = id;
	this.msgMechanism = msgMechanism;
	this.tournamentID = tournamentID;

	this.init();

}

User.prototype.send = function(msg) {
	console.log("MSG TO USER " + this.id);
	this.msgMechanism.send(msg);
}

User.prototype.getID = function() {
	return this.id;
}

User.prototype.init = function() {
	this.msgMechanism.setUser(this);
	this.msgMechanism.onConnectionDown(this.msgMechanismIsDown.bind(this));
	this.msgMechanism.onConnectionUp(this.msgMechanismIsUp.bind(this));
}

User.prototype.msgMechanismIsDown = function() {
	console.log("USER " + this.id + ": Connection down");
}
User.prototype.msgMechanismIsUp = function() {
	console.log("USER " + this.id + ": Connection up!");
}

module.exports = function(id, msgMechanism, tournamentID) {
	return new User(id, msgMechanism, tournamentID);
}