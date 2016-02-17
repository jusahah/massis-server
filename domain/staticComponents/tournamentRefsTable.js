var Tournament = require('../dynamicComponents/Tournament');
var _ = require('lodash');

var currIDCounter = Date.now(); // Initialize to current ms count -> no two server restarts will ever clash will same tourney ids!
var tournamentTable = {};

var nextRoundPurge = [];


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
	},
	removeTournament: function(id) {
		tournamentTable[id] = null;
		delete tournamentTable[id];
		console.log("Removed tournament id from tournamentTable: " + id);
	},
	getTournamentCount: function() {
		var c = 0;
		_.forOwn(tournamentTable, function(_t, _id) {
			c++;
		});

		return c;
	},
	startGC: function(timeInterval) {
		setInterval(this.purge.bind(this), timeInterval);
	},
	purge: function() {
		console.log("_________")
		console.log("Purge starts");
		_.each(nextRoundPurge, function(id) {
			tournamentTable[id] = null;
			delete tournamentTable[id];
			console.log("PURGED TOURNAMENT: " + id);
		});
		nextRoundPurge = [];
		_.forOwn(tournamentTable, function(t, id) {
			if (t.hasEnded()) nextRoundPurge.push(id);
		});
		console.log("To be purged next round: " + nextRoundPurge.length);
		console.log("Purge ends");
		console.log("________");
	}
};