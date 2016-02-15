function DefaultAlg(timeLimitInSecs) {

	this.name = 'default';
	this.timeLimit = timeLimitInSecs;

}

DefaultAlg.prototype.score = function(wasCorrect, timeToAnswerInMs) {
	var timeToAnswer = Math.round(timeToAnswerInMs / 1000);
	var timePoints = wasCorrect ? (this.timeLimit - timeToAnswer) : 0; //
	return timePoints <= 0 ? 0 : timePoints; 
}


// Algorithm wrapper
function Scorer(algorithm) {
	this.algorithm = algorithm;
}

Scorer.prototype.score = function(wasCorrect, timeToAnswerInMs) {
	// Do something else later here, perhaps..
	return this.algorithm.score(wasCorrect, timeToAnswerInMs);
}

Scorer.prototype.getAlgName = function() {
	return this.algorithm.name;
}

Scorer.prototype.getFormula = function() {
	return this.score.toString();
}

module.exports = function(timeLimit, algorithm) {
	timeLimit = Math.round(timeLimit/1000) || 15;
	algorithm = algorithm || new DefaultAlg(timeLimit);
	return new Scorer(algorithm);
}