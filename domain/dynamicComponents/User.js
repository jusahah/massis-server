var idsToTournaments = require('../staticComponents/tournamentRefsTable');

// NOTE
// User object lives in the domain layer!
// MsgMechanism lives in the technical layer!
function User(id, msgMechanism, tournamentID, disconnectCb) {
	this.id = id;
	this.msgMechanism = msgMechanism;
	this.tournamentID = tournamentID;

	this.disconnectCb = disconnectCb;

	this.userName;

	this.init = function() {
		this.msgMechanism.setUser(this);
		this.msgMechanism.onConnectionDown(this.msgMechanismIsDown.bind(this));
		this.msgMechanism.onConnectionUp(this.msgMechanismIsUp.bind(this));
		this.msgMechanism.onMessage(this.receive.bind(this));
	}
	this.receive = function(msg) {
		console.log("MSG FROM USER: " + msg.tag);
		// Forward to Tournament who takes care of these normal msgs
		var tournament = idsToTournaments.getTournament(this.tournamentID);
		console.log(this.tournamentID);
		console.log(tournament);

		if (tournament) {
			tournament.msgFromPlayer(this.id, msg);
		}

	}

	this.init();

}

User.prototype.send = function(msg) {
	// Remove setTimeout for production
	setTimeout(function() {
		console.log("MSG TO USER " + this.id);
		this.msgMechanism.send(msg);
	}.bind(this), 0)

}

User.prototype.receive = function(msg) {
	console.log("MSG FROM USER: " + msg.tag);
	// Forward to Tournament who takes care of these normal msgs
	var tournament = idsToTournaments.getTournament(this.tournamentID);
	console.log(this.tournamentID);
	console.log(tournament);

	if (tournament) {
		tournament.msgFromPlayer(this.id, msg);
	}

}

User.prototype.getID = function() {
	return this.id;
}
User.prototype.getTournamentID = function() {
	return this.tournamentID;
}

User.prototype.init = function() {
	this.msgMechanism.setUser(this);
	this.msgMechanism.onConnectionDown(this.msgMechanismIsDown.bind(this));
	this.msgMechanism.onConnectionUp(this.msgMechanismIsUp.bind(this));
	this.msgMechanism.onMessage(this.receive.bind(this));
}

User.prototype.msgMechanismIsDown = function() {
	console.log("USER " + this.id + ": Connection down");
	if (this.disconnectCb) this.disconnectCb(this);
}
User.prototype.msgMechanismIsUp = function() {
	console.log("USER " + this.id + ": Connection up!");
}

module.exports = function(id, msgMechanism, tournamentID) {
	return new User(id, msgMechanism, tournamentID);
}