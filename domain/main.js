
// For now this is mostly for testing
// REQUIRING THIS ALLOW AUTORELOAD OF TESTS
//var tests = require('../test/test.js');
var jquery = require('jquery');

var msgSink    = require('./msgSink');
var controller = require('./controller');
var Question = require('./dynamicComponents/Question');
var Scorer = require('./dynamicComponents/Scorer');
var QuestionVault = require('./dynamicComponents/QuestionVault');
var RoundResults  = require('./dynamicComponents/RoundResults');
var Standings     = require('./dynamicComponents/Standings');
var merger       = require('../domain/dynamicComponents/StandingsMerger');
var tournamentTable = require('../domain/staticComponents/tournamentRefsTable');
var idsToUsers = require('./staticComponents/userIDsToUsers');
// Fakes, mocks, etc
var ConsoleLogger  = require('./dynamicComponents/fakes/ConsoleLogger');
var DomElementUser = require('./dynamicComponents/fakes/DomElementUser');
var VisualLogging = require('./dynamicComponents/fakes/VisualLogging');

console.log(msgSink);
console.log(tournamentTable);
console.log(merger);
console.log(Standings);
console.log(RoundResults);
console.log(QuestionVault);
console.log(Question);
console.log(Scorer);
console.log(controller.test());

msgSink.setController(controller);
msgSink.setUsersTable(idsToUsers);

// We can start playing against ourselves here

// Note that JOI validation does not work on browsers
var tid = controller.addTournament({
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
	timeToAnswer: 5000,
	timeBetweenQuestions: 5000,
	startsAt: Date.now() + 4 * 1000
});



for (var i = 5; i >= 0; i--) {
	var u = new DomElementUser();
	var registrationResult = controller.userJoined(tid, u);
	if (registrationResult.success) {
		var answerButtons = "<button id='a'>A</button><button id='b'>B</button><button id='c'>C</button><button id='d'>D</button>"
		var html = "<div class='userel' id='user_" + registrationResult.uid + "'><h4 style='text-align: center;'>" + registrationResult.uid + "</h4><ul class='msgUL'></ul>" + answerButtons + "</div>";
		jquery('#users').append(html);
		var ue = jquery('#users').find("#user_" + registrationResult.uid);
		u.setElement(ue);
		u.setUID(registrationResult.uid);
		var uid = registrationResult.uid;
		// We connect user object straight to the element he is managing
		ue.customFakeUser = u;
		ue.on('click', function(e) {
			if (jquery(e.target).prop("tagName").toUpperCase() === 'BUTTON') {
				console.log("BUTTON CLICK");
				var choice = jquery(e.target).attr('id');
				ue.customFakeUser.receive({tag: 'answerIn', data: choice});
			}
		});
	}

	console.log(registrationResult);
};







var info = controller.getTournamentStatusInfo(tid);



