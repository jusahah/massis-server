var Question = require('./Question');
var _ = require('lodash');


function QuestionVault(questionsDataArr) {
	this.questionsDataArr = questionsDataArr;
	this.questions = [];	

	this.init = function() {
		_.each(this.questionsDataArr, function(questionData) {

			var q = Question(questionData);
			if (!q.isQuestionInvalid()) this.questions.push(q); // Add to Question array
		}.bind(this));
		this.questionsAmount = this.questions.length; // Saves original question amount
		return true;
	}

	this.init();

}

QuestionVault.prototype.peekNextQuestion = function() {
	if (this.questions.length === 0) return null;
	return this.questions[0];
}

QuestionVault.prototype.getNextQuestion = function() {
	if (this.questions.length === 0) return null;
	return this.questions.shift();	

}

QuestionVault.prototype.getQuestionsLeft = function() {
	return this.questions.length;
}

QuestionVault.prototype.totalQuestionsNumber = function() {
	return this.questionsAmount;
}

module.exports = function(questionsArr) {
	return new QuestionVault(questionsArr);
}