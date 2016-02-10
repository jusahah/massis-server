var _ = require('lodash');
var idsToUsers = require('./staticComponents/userIDsToUsers');
var idsToTournaments = require('./staticComponents/tournamentRefsTable');
var userNamesToIDs   = require('./staticComponents/userNamesToIds');
var validator        = require('validator');
var xss              = require('xss-filters');

// Straight from SO
function isInt(value) {
  var x;
  if (isNaN(value)) {
    return false;
  }
  x = parseFloat(value);
  return (x | 0) === x;
}

/*
	Provides high-level facace API for accessing domain layer and its services
*/

// Tournament data schema looks like following:
/*
{
		maxPlayers: 13,
		name: "Tuesday Special",
		description: "Win huge prizes, like hot air balloons. Only on tuesdays",
		questions: [
			{
				question: "Capital of Algeria?",
				choices: {
					a: "Helsinki",
					b: "Turku",
					c: "Algiers",
					d: "Porvoo"
				},
				answer: 'c',		
			}
			
		],
		timeToAnswer: Math.random()*2000 + 3000,
		timeBetweenQuestions: 3000 + Math.floor(Math.random()*2000),
		startsAt: Date.now() + 118 * 1000 + Math.random()*2000 + 200
}
*/
function tournamentDataSanitization(data) {
	// Integers dont need sanitization, they are checked later by Joi ensuring they are ints
	// For string, we do double sanitization using two different libraries
	// Overkill? Sure.
	var sanitizedData = {
		maxPlayers: data.maxPlayers,
		name: xss.inHTMLData(validator.escape(data.name)),
		description: xss.inHTMLData(validator.escape(data.description)),
		timeToAnswer: data.timeToAnswer,
		timeBetweenQuestions: data.timeBetweenQuestions,
		startsAt: data.startsAt
	}

	// Questions is array so its sanitized separetely
	var questions = data.questions;
	var sanitizedQuestions = [];

	_.each(questions, function(q) {
		var sanitizedQuestion = {
			question: xss.inHTMLData(validator.escape(q.question)),
			choices: {
				a: xss.inHTMLData(validator.escape(q.choices.a)).substring(0, 64),
				b: xss.inHTMLData(validator.escape(q.choices.b)).substring(0, 64),
				c: xss.inHTMLData(validator.escape(q.choices.c)).substring(0, 64),
				d: xss.inHTMLData(validator.escape(q.choices.d)).substring(0, 64)
			},
			answer: xss.inHTMLData(validator.escape(q.answer))
		}
		sanitizedQuestions.push(sanitizedQuestion);
	});

	sanitizedData.questions = sanitizedQuestions;		

	return sanitizedData;


}


// Controller provides main facade of domain-level services!
module.exports = {
	test: function() {
		return 1;
	},
	// API PART
	addTournament: function(tournamentData) {
		// Consider validation data object with Joi
		/* OBSOLETE - decided to go with basic timestamp validation
		// Turn tournamentData.startsAt into Date object if its timestamp
		if (isInt(tournamentData.startAt)) {
			// Turn to Date
			tournamentData.startsAt = new Date(tournamentData.startAt);
		}
		// If its not int we trust that its a Date object already
		*/
		var tournamentData = tournamentDataSanitization(tournamentData); // Sanitize right away
		var tid = idsToTournaments.insertTournament(tournamentData); // Returns tournament id (that was allocated)
		if (!tid) {
			// Data validation error
			console.error("Tournament data did not pass validation");
			console.log(tournamentData);
			return false;
		}

		return tid;

	},
	getTournamentStatusInfo: function(tid) {
		var tournament = idsToTournaments.getTournament(tid);
		if (!tournament) {
			// Does not exist
			return {success: false, reason: "Tournament does not exist - it may have ended already!"};
		}
		return tournament.getStatusInfo();

	},
	// User joining into domain-layer needs him to provide tournamentID 
	// (every user must be connected with one and only one tournament)
	// and msgMechanism (which is socket wrapper for typical web user)

	userJoined: function(userName, tournamentID, msgMechanism) {
		// First check that tournament is available and has not started yet
		var tournament = idsToTournaments.getTournament(tournamentID);
		if (!tournament) {
			// Does not exist
			return {success: false, reason: "Tournament does not exist - it may have ended already!"};
		}

		if (!tournament.allowsRegistration()) {
			// Tournament may have started already or it has capped max players limit
			return {success: false, reason: "Tournament does not take new registrations anymore"};
		}
		// First sanitize username twice
		userName = xss.inHTMLData(userName);   // 1st sanitization 
		userName = validator.escape(userName); // 2nd sanitization
		userName = validator.trim(userName); // Remove white spaces from both ends
		userName = userName.substring(0, 24); // Remove overflow parts of the name

		// Check username for clashes
		if (!userNamesToIDs.checkNameAvailability(userName)) {
			return {success: false, reason: "User name already in use!"};
		}
		// All is fine, create user into domain layer!
		// Note that User object does not know its own userName - only the global table does
		var uid = idsToUsers.createUser(msgMechanism, tournamentID);
		// We could potentially check if uid is truthy and thus allow idsToUsers have max users limit on this server
		// But naah... overkill for now

		// Register user id into the tournament
		tournament.registerUser(uid);
		// Return uid to caller (which is socket wrapper most often)
		return {success: true, uid: uid, tid: tournamentID};

	},
	userLeft: function(uid) {
		// Most often called by User object itself after socket connection went down
		var user = idsToUsers.getUser(uid);
		if (user) {
			var tid = user.getTournamentID();
			var tournament = idsToTournaments.getTournament(tid);
			if (tournament) {
				// All is good
				// Start by informing tournament that user left
				// Tournament takes care of all cleaning of player data from its child objects and stuff
				tournament.playerLeft(uid);
				// Next clean user from usersTable
				idsToUsers.removeUser(uid);
				console.log("User left server: " + uid);
				// And we are done - garbage collection will take care of rest
				return true;

			}

			return false;

		}

		return false;

	},



}

