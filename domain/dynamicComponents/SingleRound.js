var RoundResults = require('./RoundResults');
var Scorer       = require('./Scorer');
var msgSink   = require('../msgSink');

console.log("msgSink IN ROUND");
console.log(msgSink);

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

	this.roundStartTime;
}

SingleRound.prototype.start = function() {
	// Create RoundResults object for gathering results
	console.log("SingleRound starts");
	this.rr = RoundResults();
	this.scorer = Scorer(this.timeToAnswer, null); // null forces Scorer to use default algorithm
	// Starts a round
	this.openForAnswers = true;
	console.log(msgSink);
	msgSink.informUniformly(this.userList, {
		tag: 'newQuestion', 
		data: {
			question: this.question.getQuestion(), 
			choices: this.question.getChoices(),
			timeToAnswer: this.timeToAnswer,
			questionID: Date.now() + "_" + randomInt() 
		}
	});
	this.roundStartTime = Date.now();
	console.log("Single ROUND STARTED AND ENDS IN: " + this.timeToAnswer);
	console.log("START TIME: " + this.roundStartTime);
	setTimeout(function() {
		console.log("TIME TRIGGER: Single round about to end");
		this.closeRound();
	}.bind(this), this.timeToAnswer);
}

SingleRound.prototype.closeRound = function() {
	console.log("Single round closes");
	this.openForAnswers = false;
	this.expireCallback();
	// This round's responsibilites stop here
}

SingleRound.prototype.resolveTimeTaken = function() {
	return Date.now() - this.roundStartTime;
}

SingleRound.prototype.answerIn = function(uid, answer, timeTaken) {
	console.warn("Answer did reach round object");
	if (this.alreadyAnswered.hasOwnProperty(uid)) return false;
	timeTaken = timeTaken || this.resolveTimeTaken();
	this.alreadyAnswered[uid] = true;
	var wasCorrect = this.question.evalAnswer(answer);
	var score      = this.scorer.score(wasCorrect, timeTaken);
	this.rr.addPoints(uid, score);
	console.log("Score added for player: " + uid + ", score: " + score);
	return {wasCorrect: wasCorrect};
}

SingleRound.prototype.getRoundResults = function() {
	return this.rr;
}

module.exports = function(userList, question, timeToAnswer, expireCallback) {
	return new SingleRound(userList, question, timeToAnswer, expireCallback);
}