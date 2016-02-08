// Tool deps
var _   = require('lodash');
var Joi = require('joi'); 

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

// Tournament object
function Tournament(data) {
	this.tournamentData = data;

	this.questionVault;
	this.questionsWereDiscarded = false;
	
	this.currentState;
	this.round;

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
		this.currentState = new WaitingForStartState(this);
	}

	this.init();


}

Tournament.prototype.buildQuestionVault = function(questions) {
	this.questionVault = QuestionVault(questions);
	var numOfQuestionsInserted = this.questionVault.getQuestionsLeft();

	if (numOfQuestionsInserted !== questions.length) {
		// Some of the questions were discarded
		this.questionsWereDiscarded = true;
		// Broadcast notification outwards too
	}
	

}
Tournament.prototype.tournamentOver = function() {
	// Tournament over
}

Tournament.prototype.start = function() {
	this.currentState = new PreparingNextQuestion(this);
	var q = this.questionVault.getNextQuestion();
	if (!q) {
		// Tournament over
		return this.tournamentOver();
	}
	this.round = SingleRound(q, this.tournamentData.timeToAnswer, this.roundEnded.bind(this));
	this.scheduleNextRound(this.round);
	this.tournamentStateChange();

}

Tournament.prototype.roundEnded = function() {
	// Handle round ending
	// Call new standings infering stuff
}

Tournament.prototype.scheduleNextRound = function(round) {
	// Settimeout something to launch round
}

Tournament.prototype.tournamentStateChange = function() {
	// Informs players of state change
	controller.informUniformly(this.userList, this.currentState.getClientMsg());
}

Tournament.prototype.getStateName = function() {
	if (this.currentState) return this.currentState.name;
	return 'nostate';
}

Tournament.prototype.registerUser = function(uid) {
	if (this.tournamentData.maxPlayers <= this.userList.length) return false;
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