var _ = require('lodash');
var idsToUsers = require('./staticComponents/userIDsToUsers');

/*
	Provides high-level facace API for accessing domain layer and its services
*/


// Controller provides main facade of domain-level services!
module.exports = {
	test: function() {
		return 1;
	},
	// API PART
	addTournament: function(tournamentData) {
		// Consider validation data object with Joi
		var name = tournamentData.name;
		var startingTime = tournamentData.startingTime;
		var questions    = tournamentData.questions;
		var maxPlayers   = tournamentData.maxPlayers;
		var description  = tournamentData.description;

	},
	// User joining into domain-layer needs him to provide tournamentID 
	// (every user must be connected with one and only one tournament)
	// and msgMechanism (which is socket wrapper for typical web user)

	// Note that userLeft() method is not needed as all further communication
	// goes straight through User object
	userJoined: function(tournamentID, msgMechanism) {
		// First check that tournament is available and has not started yet

	},
	// Sends same msg to bunch of clients
	informUniformly: function(userIDs, msg) {
		var users = idsToUsers.getListOfUsers(userIDs);
		_.each(users, function(user) {
			user.send(msg);
		});
		
	},,


}

