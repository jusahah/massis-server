var Question = require('./Question');
var _ = require('lodash');


function QuestionVault(questionsDataArr) {
	this.questionsDataArr = questionsDataArr;
	this.questions = [];	

	this.init = function() {
		_.each(this.questionsDataArr, function(questionData) {
			this.questions.push(Question(questionData)); // Add to Question array
		}.bind(this));
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

module.exports = function(questionsArr) {
	return new QuestionVault(questionsArr);
}