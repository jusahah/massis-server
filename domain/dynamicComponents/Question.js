// Id we wanted to have some shared variables that
// all questions see they would go here
// var QUESTION_MAX_LENGTH = 128;

// Note - you can leave this dependency out if you don't use Question.isQuestionInvalid()
// var Joi = require('joi'); TURN ON FOR SERVER-USE
var Joi    = require('./fakes/FakeJoi'); 

var questionSchema = Joi.object().keys({
	question: Joi.string().min(1).max(256).required(),
	choices: Joi.object().required(),
	answer: Joi.string().min(1).max(1).required(),
});

function Question(questionData) {
	this.questionData = questionData;
} 

Question.prototype.getQuestion = function() {
	return this.questionData.question
}


/*
	invalid -> field that is erroneous
	valid   -> false
*/
Question.prototype.isQuestionInvalid = function() {
	var isInvalid   = false;
	console.log("VALIDATIONG SINGLE QUESTION DATA");
	console.log(this.questionData);
	Joi.validate(this.questionData, questionSchema, function(err, value) {
		if (err) {
			isInvalid = err.details[0].path;
			console.log("ERROR IN JOI: " + isInvalid);
		}
	});

	return isInvalid;

}

Question.prototype.getChoices = function() {
	return this.questionData.choices;
}

Question.prototype.getChoice = function(choice) {
	return this.questionData.choices[choice];
}

Question.prototype.getAnswer = function() {
	return this.questionData.choices[this.questionData.answer];
}

Question.prototype.getAnswerChoice = function() {
	return this.questionData.answer;
}

Question.prototype.evalAnswer = function(answerGiven) {
	return this.questionData.answer === answerGiven;
}

module.exports = function(questionData) {
	return new Question(questionData);
}