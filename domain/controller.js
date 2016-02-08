/*
	Provides high-level facace API for accessing domain layer and its services
*/


module.exports = {
	test: function() {
		return 1;
	},
	addTournament: function(tournamentData) {
		// Consider validation data object with Joi
		var name = tournamentData.name;
		var startingTime = tournamentData.startingTime;
		var questions    = tournamentData.questions;
		var maxPlayers   = tournamentData.maxPlayers;
		var description  = tournamentData.description;

	},
	// Sends same msg to bunch of clients
	informUniformly: function(userIDs, msg) {
		true;
	}

}

