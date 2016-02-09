
// For now this is mostly for testing
// REQUIRING THIS ALLOW AUTORELOAD OF TESTS
//var tests = require('../test/test.js');

var controller = require('./controller');
var Question = require('./dynamicComponents/Question');
var Scorer = require('./dynamicComponents/Scorer');
var QuestionVault = require('./dynamicComponents/QuestionVault');
var RoundResults  = require('./dynamicComponents/RoundResults');
var Standings     = require('./dynamicComponents/Standings');
var merger       = require('../domain/dynamicComponents/StandingsMerger');
var tournamentTable = require('../domain/staticComponents/tournamentRefsTable');


console.log(tournamentTable);
console.log(merger);
console.log(Standings);
console.log(RoundResults);
console.log(QuestionVault);
console.log(Question);
console.log(Scorer);
console.log(controller.test());

// We can start playing against ourselves here

// Note that JOI validation does not work on browsers
var res = controller.addTournament({
	maxPlayers: 5,
	name: "Tuesday Special",
	description: "Win huge prizes, like hot air balloons. Only on tuesdays",
	questions: [
		{
			question: "Capital of Algeria?",
			choices: {
				a: "Helsinki",
				b: "Turku",
				c: "Algiers",
				d: "Porvoo"
			},
			answer: 'c',		
		},
		{
			question: "Capital of Eritrea?",
			choices: {
				a: "Asmara",
				b: "Aspiriini",
				c: "Ankara",
				d: "Ala-Ballah-Dalah-Bla"
			},
			answer: 'a',		
		},
		{
			question: "Capital of Botswana?",
			choices: {
				a: "Gaborone",
				b: "Gatorade",
				c: "Pepsodent",
				d: "Red Bull"
			},
			answer: 'a',		
		},
		{
			question: "Capital of Malawi?",
			choices: {
				a: "Windhoek",
				b: "Maputo",
				c: "Lilongwe",
				d: "Pihtipudas"
			},
			answer: 'c',		
		}					

	],
	timeToAnswer: 10,
	timeBetweenQuestions: 5,
	startsAt: Date.now() + 10 * 1000
});


