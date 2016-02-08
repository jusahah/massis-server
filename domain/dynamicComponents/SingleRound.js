function SingleRound(question, timeToAnswer, expireCallback) {

	this.question = question;
	this.timeToAnswer = timeToAnswer;
	this.expireCallback = expireCallback;


}

module.exports = function(question, timeToAnswer, expireCallback) {
	return SingleRound(question, timeToAnswer, expireCallback);
}