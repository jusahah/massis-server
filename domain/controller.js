var _ = require('lodash');
var idsToUsers = require('./staticComponents/userIDsToUsers');
var idsToTournaments = require('./staticComponents/tournamentRefsTable');
var userNamesToIDs   = require('./staticComponents/userNamesToIds');
var validator        = require('validator');
var xss              = require('xss-filters');

var request          = require('request');

idsToTournaments.startGC(25000);


// Private helper fun, straight from SO
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
// Private helper fun
function tournamentDataSanitization(data) {
	// Integers dont need sanitization, they are checked later by Joi ensuring they are ints
	// For string, we do double sanitization using two different libraries
	// Overkill? Sure.
	var sanitizedData = {
		id: data.id,
		maxPlayers: data.maxPlayers,
		name: xss.inHTMLData(validator.escape(data.name.substring(0, 128))),
		description: xss.inHTMLData(validator.escape(data.description.substring(0, 1024))),
		timeToAnswer: data.timeToAnswer < 101 ? data.timeToAnswer*1000 : data.timeToAnswer*1,
		timeBetweenQuestions: data.timeBetweenQuestions < 101 ? data.timeBetweenQuestions*1000 : data.timeBetweenQuestions*1,
		startsAt: data.startsAt
	}

	// Questions is array so its sanitized separetely
	var questions = data.questions;
	var sanitizedQuestions = [];

	_.each(questions, function(q) {
		var sanitizedQuestion = {
			question: xss.inHTMLData(validator.escape(q.question.substring(0, 256))),
			choices: {
				a: xss.inHTMLData(validator.escape(q.choices.a.substring(0, 64))),
				b: xss.inHTMLData(validator.escape(q.choices.b.substring(0, 64))),
				c: xss.inHTMLData(validator.escape(q.choices.c.substring(0, 64))),
				d: xss.inHTMLData(validator.escape(q.choices.d.substring(0, 64)))
			},
			answer: xss.inHTMLData(validator.escape(q.answer))
		}
		sanitizedQuestions.push(sanitizedQuestion);
	});

	sanitizedData.questions = sanitizedQuestions;		

	return sanitizedData;


}


// Controller provides main facade of domain-level services!

// DOMAIN-LAYER FACADE
module.exports = {
	callbacks: {
		tournamentDone: null
	},
	test: function() {
		return 1;
	},

	getCurrentUserCount: function() {
		return idsToUsers.getCount();
	},

	// PLUG-IN PART FOR OTHER PARTS OF SYSTEM GET NOTIFICATION FROM DOMAIN
	whenTournamentDone: function(cb) {
		this.callbacks.tournamentDone = cb;
	},

	// --------------------------------
	// SYSTEM INNER API
	// --------------------------------
	msgFromComponent: function(msg) {
		if (msg.tag === 'tournamentDone') {
			if (this.callbacks.tournamentDone) {
				this.callbacks.tournamentDone(msg.data);
				setTimeout(function() {
					idsToTournaments.removeTournament(msg.data.originalID);
				}, 0)
			}
		}
	},


	//-------------------------------------
	// OFFICIAL API PART
	//-------------------------------------

	//
	// GETTERS (provide way to inspect system state in realtime)
	//
	getRunningTournaments: function() {
		var tournaments = idsToTournaments.listOfTournaments(); // Currently running
		var tournamentInfos = _.map(tournaments, function(t) {
			return t.getInfo();
		});
		return tournamentInfos;

	},
	getTournamentStatusInfo: function(tid) {
		var tournament = idsToTournaments.getTournament(tid);
		if (!tournament) {
			// Does not exist
			return {success: false, reason: "Tournament does not exist - it may have ended already!"};
		}
		return tournament.getStatusInfo();

	},

	//
	// SETTERS, MODIFIERS (provide way to modify system state in realtime)
	//
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
		console.log(" TOURNAMENT DATA INSIDE TOURNAMENT ADDER IN CONTROLLER");
		console.log(tournamentData)
		// Search for odds inside questions
		var questionTextWithOdds = {};
		_.each(tournamentData.questions, function(question) {
			if (question.hasOwnProperty('odds')) {
				questionTextWithOdds[question.question] = question.odds;
			}
			question.odds = null; // sever from original data
		});
		// Question odds now retrieved and stashed

		var tournamentData = tournamentDataSanitization(tournamentData); // Sanitize right away
		var tid = idsToTournaments.insertTournament(tournamentData); // Returns tournament id (that was allocated)
		if (!tid) {
			// Data validation error
			console.error("Tournament data did not pass validation");
			console.log(tournamentData);
			return false;
		}
		console.log("SEND TOURNAMENT DATA TO FAKE PROCESS");
		// Send here to fake process the tid
		return tid;
		request({
			url: 'http://localhost:8071/newtournament',
			method: 'POST',
			form: {info: JSON.stringify(tournamentData), odds: JSON.stringify(questionTextWithOdds)}
		}, function(error, response, body) {
			console.log(response.statusCode);
			console.log(body);
			if (response.statusCode == 200) {
				return;
				var tournaments = JSON.parse(body);

				if (tournaments.length !== 0) {
					// Send to whoever provided callback
					console.log("TOURNAMENTS RECEIVED: " + tournaments.length);	
					tournamentsFoundCb(tournaments);	
							
				} else {
					console.log("NO TOURNAMENTS RECEIVED");
				}				
			}


		});

		return tid;

	},

	// User joining into domain-layer needs him to provide tournamentID 
	// (every user must be connected with one and only one tournament)
	// and msgMechanism (which is socket wrapper for typical web user)

	userJoined: function(userName, tournamentID, msgMechanism) {
		// First check that tournament is available and has not started yet
		console.log("CONTROLLER: User joined with: " + userName + ", " + tournamentID);
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
		userNamesToIDs.registerName(userName, uid);
		// Register user id into the tournament
		tournament.registerUser(uid);
		// Return uid to caller (which is socket wrapper most often)
		return {success: true, uid: uid, tid: tournamentID, info: tournament.getInfo()};

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

