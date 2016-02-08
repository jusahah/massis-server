var Tournament = require('../dynamicComponents/Tournament');
var _ = require('lodash');

var currIDCounter = Date.now(); // Initialize to current ms count -> no two server restarts will ever clash will same tourney ids!
var tournamentTable = {};


// This module is also only one in the production system which can create tournaments!
module.exports = {
	insertTournament: function(tournamentData) {
		var t = Tournament(tournamentData);
		if (!t.dataValid()) return false;

		// generate ID for tournament
		var id = currIDCounter++;
		tournamentTable[id] = t;
		this.tournamentTableChange();
		return id;
	},
	getTournament: function(id) {
		return tournamentTable[id];
	},
	listOfTournaments: function() {
		var tournaments = [];
		_.forOwn(tournamentTable, function(tournament, id) {
			// Nobody is allowed to get direct ref to tournament inside a collection
			tournaments.push({tournamentInfo: tournament.getInfo(), id: id});

		});
		return tournaments;
	},
	tournamentTableChange: function() {
		// Use for broadcastin data change to disk layer
	}
};