function randomInt() {
	return Math.floor(Math.random() * 1000000);
}

function SingleRound(userList, question, timeToAnswer, expireCallback) {

	this.userList = userList;
	this.question = question;
	this.timeToAnswer = timeToAnswer;
	this.expireCallback = expireCallback;

	this.openForAnswers = false;
}

SingleRound.prototype.start = function() {
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
	
}

module.exports = function(question, timeToAnswer, expireCallback) {
	return SingleRound(question, timeToAnswer, expireCallback);
}