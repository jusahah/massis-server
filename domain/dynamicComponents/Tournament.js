// Tool deps
var _   = require('lodash');
// var Joi = require('joi'); TURN ON FOR SERVER-USE
var Joi    = require('./fakes/FakeJoi'); 

// App deps
var QuestionVault = require('./QuestionVault');
var Standings     = require('./Standings');
var Scorer        = require('./Scorer');
var SingleRound   = require('./SingleRound');
var mergeFun      = require('./StandingsMerger');

var controller    = require('../controller');

var tournamentSchema = Joi.object().keys({
	maxPlayers: Joi.number().integer().min(2).max(1000).required(),
	name: Joi.string().min(1).max(64).required(),
	description: Joi.string().min(1).max(256).required(),
	questions: Joi.array().min(1).max(99).required(),
	timeToAnswer: Joi.number().integer().min(5).max(60).required(),
	timeBetweenQuestions: Joi.number().integer().min(3).max(60).required(),
	startsAt: Joi.number().integer().required()
});

function WaitingForStartState(tournament) {

	this.tournament = tournament;
	this.name = 'waitingForStart';

}

// States
WaitingForStartState.prototype.getClientMsg = function() {
	// In production version map all these to integers!
	return {tag: 'stateChange', 'state': this.name};
}

function PreparingNextQuestion(tournament) {
	this.tournament = tournament;
	this.name = 'preparingNextQuestion';
}

PreparingNextQuestion.prototype.getClientMsg = function() {
	// In production version map all these to integers!
	return {tag: 'stateChange', 'state': this.name};
}

function WaitingForAnswers(tournament) {
	this.tournament = tournament;
	this.name = 'waitingForAnswers';

}

WaitingForAnswers.prototype.getClientMsg = function() {
	return {tag: 'stateChange', state: this.name};
}

function TournamentEnded(tournament) {
	this.tournament = tournament;
	this.name = 'tournamentEnded';
}

TournamentEnded.prototype.getClientMsg = function() {
	return {tag: 'stateChange', state: this.name};
}

// Tournament object
function Tournament(data) {
	this.tournamentData = data;

	this.questionVault;
	this.questionsWereDiscarded = false;
	
	this.currentState;
	this.round;
	// Standings of players (Standings object)
	this.currentStandings;

	// Users who have left
	this.leftDuringPlay = [];

	this.tournamentInvalid = false;

	this.userList = [];

	this.init = function() {
		var isInvalid = false;
		Joi.validate(this.tournamentData, tournamentSchema, function(err, value) {
			if (err) {
				isInvalid = err.details[0].path;
			}
		});

		if (isInvalid) {
			// Tournament data does not meet requiremenets
			// Do something wild
			this.tournamentInvalid = isInvalid;
		}

		// all is good, we still need to check questions data though
		this.buildQuestionVault(this.tournamentData.questions);
		this.changeState(new WaitingForStartState(this));
	}

	this.init();


}

Tournament.prototype.dataValid = function() {
	return this.tournamentInvalid === false;
}

Tournament.prototype.buildQuestionVault = function(questions) {
	this.questionVault = QuestionVault(questions);
	var numOfQuestionsInserted = this.questionVault.getQuestionsLeft();

	if (numOfQuestionsInserted !== questions.length) {
		// Some of the questions were discarded
		this.questionsWereDiscarded = true;
		// Broadcast notification outwards too
	}
	return true;
	

}
Tournament.prototype.playerLeft = function(uid) {
	// It is bit peculiar but we actually dont need to do anything here
	// Well, actually, we might want to store this info so clients can be sent
	// a list of disconnected users
	this.leftDuringPlay.push(uid);
	return true;

}

Tournament.prototype.start = function() {
	this.currentStandings = Standings(this.userList); // Initialize Standings object
	this.changeState(new PreparingNextQuestion(this)); // Move to new state
	var q = this.questionVault.getNextQuestion();
	if (!q) {
		// Tournament over
		console.error("TOURNAMENT: Tournament ended without a single question being played: " + Date.now());
		return this.tournamentOver();
	}
	this.round = SingleRound(this.userList, q, this.tournamentData.timeToAnswer, this.roundEnded.bind(this));
	this.scheduleNextRound(this.round);


}

Tournament.prototype.changeState = function(newState) {
	this.currentState = newState;
	this.broadcastStateChange();
}

Tournament.prototype.tournamentOver = function() {
	this.changeState(new TournamentEnded(this));

}

Tournament.prototype.roundEnded = function() {
	// Handle round ending
	// Call new standings infering stuff
	var endedRound = this.round;
	if (this.questionVault.getQuestionsLeft() !== 0) {
		// Tournament goes on
		this.changeState(new PreparingNextQuestion(this));
		var q = this.questionVault.getNextQuestion();
		this.round = SingleRound(this.userList, q, this.tournamentData.timeToAnswer, this.roundEnded.bind(this));
		this.scheduleNextRound(this.round);
	} else {
		this.tournamentOver();
	}

	// While we are waiting for next round (or have ended) lets compute new standings
	var infoO = this.computeNewStandings(endedRound); // Returns standings + standing views
	this.currentStandings = infoO.standings; // Set new standings
	var views = infoO.standingViews;
	// Next lets broadcast standing views to all players
	// A standing view is data object telling how a particular user sees the standings list
	// We cannot user controller.informUniformly() as data going to different players is different
	// So we use controller.informUser()
	_.each(this.userList, function(uid) {
		var userView = views[uid];
		controller.informUser(uid, {tag: 'newStandings', data: userView});
	}.bind(this));



}


Tournament.prototype.computeNewStandings = function(endedRound) {
	// First we have to get results object of ended round
	var rr = endedRound.getRoundResults();
	return mergeFun(this.currentStandings, rr); // Compute new standings + standing viewa


}

Tournament.prototype.allowRegistrations = function() {
	if (this.currentState.name !== 'waitingForStart') return false;
	if (this.tournamentData.maxPlayers <= this.userList.length) return false;	
}

Tournament.prototype.scheduleNextRound = function(round) {
	// Settimeout something to launch round
	// For now just use setTimeout
	setTimeout(function() {
		this.changeState(new WaitingForAnswers(this));
		round.start();
	}.bind(this), this.tournamentData.timeBetweenQuestions);
}

Tournament.prototype.broadcastStateChange = function() {
	// Informs players of state change
	console.log("CONTROLLER BRLOW");
	console.log(controller);
	//controller.informUniformly(this.userList, this.currentState.getClientMsg());
}

Tournament.prototype.getStateName = function() {
	if (this.currentState) return this.currentState.name;
	return 'nostate';
}

Tournament.prototype.registerUser = function(uid) {
	// Do not call this method unless first VALIDATED that tournament can take in more players!
	// Validation done elsewhere (this.allowRegistrations)
	//if (this.currentState.name !== 'waitingForStart') return false;
	//if (this.tournamentData.maxPlayers <= this.userList.length) return false;
	this.userList.push(uid);
	return true;
}

// Get total num of questions
Tournament.prototype.getQuestionsNumber = function() {
	return this.questionVault.totalQuestionsNumber();
}

module.exports = function(data) {
	return new Tournament(data);
}