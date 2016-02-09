var RoundResults = require('./RoundResults');
var Scorer       = require('./Scorer');

function randomInt() {
	return Math.floor(Math.random() * 1000000);
}

function SingleRound(userList, question, timeToAnswer, expireCallback) {

	this.userList = userList;
	this.question = question;
	this.timeToAnswer = timeToAnswer;
	this.expireCallback = expireCallback;

	this.rr;
	this.scorer;

	this.openForAnswers = false;
	this.alreadyAnswered = {};
}

SingleRound.prototype.start = function() {
	// Create RoundResults object for gathering results
	this.rr = RoundResults();
	this.scorer = Scorer(this.timeToAnswer, null); // null forces Scorer to use default algorithm
	// Starts a round
	this.openForAnswers = true;
	controller.informUniformly(this.userList, {
		tag: 'newQuestion', 
		data: {
			question: this.question.getQuestion(), 
			choices: this.question.getChoices(),
			timeToAnswer: this.timeToAnswer,
			questionID: Date.now() + "_" + randomInt() 
		}
	});

	setTimeout(function() {
		this.closeRound();
	}.bind(this), this.timeToAnswer);
}

SingleRound.prototype.closeRound = function() {
	this.openForAnswers = false;
	this.expireCallback();
	// This round's responsibilites stop here
}

SingleRound.prototype.answerIn = function(uid, answer, timeTaken) {
	if (this.alreadyAnswered.hasOwnProperty(uid)) return false;
	timeTaken = timeTaken || this.timeToAnswer;
	this.alreadyAnswered[uid] = true;
	var wasCorrect = this.question.evalAnswer(answer);
	var score      = this.scorer.score(wasCorrect, timeTaken);
	this.rr.addPoints(uid, score);
	return true;
}

SingleRound.prototype.getRoundResults = function() {
	return this.rr;
}

module.exports = function(userList, question, timeToAnswer, expireCallback) {
	return SingleRound(userList, question, timeToAnswer, expireCallback);
}