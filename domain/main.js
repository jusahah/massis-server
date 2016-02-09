
// For now this is mostly for testing
// REQUIRING THIS ALLOW AUTORELOAD OF TESTS
//var tests = require('../test/test.js');
var jquery = require('jquery');
var cytoscape = require('cytoscape');

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
/*
	elements: [ // list of graph elements to start with
	    { // node a
	      data: { id: 'a' }
	    },
	    { // node a
	      data: { id: 'b' }
	    },
	    { // node a
	      data: { id: 'c' }
	    },	    	    
	    { // node b
	      data: { id: 'd' }
	    },
	    { // edge ab
	      data: { id: 'ab', source: 'a', target: 'b' }
	    }
	],
*/

var cytoController = (function() {
	var stateColors = {
		'waitingForStart': '#555',
		'preparingNextQuestion': '#4499aa',
		'waitingForAnswers': '#FFFF66',
		'tournamentEnded': '#112211'
	}
	var connectionDown = function(uid, tid) {
		console.log("CONNECTION DOWN IN CYTO");
		if (!cy) return; // Not yet
		var edge1 = cy.getElementById(tid + "_" + uid);
		var edge2 = cy.getElementById(uid + "_" + tid);
		edge1.style({
			'width': 0
		});
		edge2.style({
			'width': 0
		});
	}
	var connectionUp = function(uid, tid) {
		if (!cy) return; // Not yet

		var edge1 = cy.getElementById(tid + "_" + uid);
		var edge2 = cy.getElementById(uid + "_" + tid);

		edge1.style({
			'width': 4
		});
		edge2.style({
			'width': 4
		});
	}	
	var msgReceived = function(uid, tid) {
		// Flash msg line
		var edge = cy.getElementById(tid + "_" + uid);
		edge.style({
			'line-color': '#88eeff',
			'width': 6
		});
		setTimeout(function() {
			edge.style({
				'line-color': '#ccc',
				'width': 4
			});			
		}, 180);		
	}

	var msgSent = function(uid, tid) {
		var edge = cy.getElementById(uid + "_" + tid);
		edge.style({
			'line-color': '#88eeff',
			'width': 6
		});

		setTimeout(function() {
			edge.style({
				'line-color': '#ccc',
				'width': 4
			});			
		}, 180);

	}

	var answerEvaluated = function(uid, wasCorrect) {
		var color = wasCorrect ? 'green' : 'red';
		var node = cy.getElementById(uid);
		node.style({
			'background-color': color
		});		

	}

	var stateChange = function(uid, toState) {
		var node = cy.getElementById(uid);
		node.style({
			'background-color': stateColors[toState]
		});

	}

	return {
		connectionDown: connectionDown,
		connectionUp: connectionUp,
		msgReceived: msgReceived,
		msgSent: msgSent,
		stateChange: stateChange,
		answerEvaluated: answerEvaluated
	}
})();

function cyReady() {
	_.each(tids,function(tid) {
		var serverNode = cy.getElementById(tid);	
		serverNode.style({
			'background-color': 'purple'
		});
	});




}
function addServerToCyArray(tid) {
	cyNodesArr.push({
		data: {id: tid}
	});
}

function addToCyArray(uid, tid) {
	cyNodesArr.push({
		data: {id: uid}
	});
	cyNodesArr.push({
		data: { id: tid + "_" + uid, source: tid, target: uid }
	})
	cyNodesArr.push({
		data: { id: uid + "_" + tid, source: uid, target: tid }
	})
}
var cyNodesArr = [];
var cy;
var cyServer;
var tids = [];

function createCY() {
	cy = cytoscape({
		ready: function() {
			setTimeout(cyReady, 10);
		},
		container: jquery('#cy'),
		elements: cyNodesArr,
		style: [ // the stylesheet for the graph
		    {
		      selector: 'node',
		      style: {
		        'background-color': '#666',
		        'label': 'data(id)'
		      }
		    },

		    {
		      selector: 'edge',
		      style: {
		        'width': 4,
		        'line-color': '#ccc',
		        'target-arrow-color': '#ccc',
		        'target-arrow-shape': 'triangle'
		      }
		    }
		],

		layout: {
		    name: 'random',
		    rows: 1
		}	
	});	
}

var userIDsToFakeUsers = {};
// We can start playing against ourselves here

// Note that JOI validation does not work on browsers
for (var i2 = 2; i2 >= 0; i2--) {
	var tid = controller.addTournament({
		maxPlayers: 13,
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
			,
			{
				question: "Capital of Malawi?",
				choices: {
					a: "Windhoek",
					b: "Maputo",
					c: "Lilongwe",
					d: "Pihtipudas"
				},
				answer: 'b',		
			}	
			,
			{
				question: "Capital of Malawi?",
				choices: {
					a: "Windhoek",
					b: "Maputo",
					c: "Lilongwe",
					d: "Pihtipudas"
				},
				answer: 'd',		
			}				
		],
		timeToAnswer: Math.random()*10000 + 5000,
		timeBetweenQuestions: 3000 + Math.floor(Math.random()*6000),
		startsAt: Date.now() + (Math.random()*4+20) * 1000
	});
	addServerToCyArray(tid);
	tids.push(tid);
	//alert("Tournament created");
	console.log("-------adding players to tourney--------")
	var limit = 4 + Math.floor(Math.random()*8)
	for (i = limit; i >= 0; i--) {
		var u = new DomElementUser(cytoController, tid);
		var registrationResult = controller.userJoined(tid, u);
		if (registrationResult.success) {
			var html = "<div class='userel' id='user_" + registrationResult.uid + "'><h4 style='text-align: center;'>" + registrationResult.uid + "</h4><div class='answerLight'></div>";
			html += buildAnswerView(registrationResult.uid);
			html += buildStandingsView(registrationResult.uid);
			html += buildWaitForStartView(uid);
			html += "</div>";
			jquery('#users').append(html);
			var ue = jquery('#users').find("#user_" + registrationResult.uid);
			u.setElement(ue);
			u.setUID(registrationResult.uid);
			var uid = registrationResult.uid;
			addToCyArray(uid, tid);
			// We connect user object straight to the element he is managing
			userIDsToFakeUsers[uid] = u;
			ue.on('click', function(e) {
				if (jquery(e.target).prop("tagName").toUpperCase() === 'BUTTON') {
					var divEl = jquery(e.target).parents('.userel');
					var uid = divEl.attr('id').split("_")[1];
					console.log("BUTTON CLICK for " + uid);
					var choice = jquery(e.target).attr('id');
					userIDsToFakeUsers[uid].receive({tag: 'answerIn', data: choice});
				}
			});
		}

		console.log(registrationResult);
	};

};



/*
for (var i = 10; i >= 0; i--) {
	var u = new DomElementUser(cytoController);
	var registrationResult = controller.userJoined(tid, u);
	if (registrationResult.success) {
		var html = "<div class='userel' id='user_" + registrationResult.uid + "'><h4 style='text-align: center;'>" + registrationResult.uid + "</h4><div class='answerLight'></div>";
		html += buildAnswerView(registrationResult.uid);
		html += buildStandingsView(registrationResult.uid);
		html += buildWaitForStartView(uid);
		html += "</div>";
		jquery('#users').append(html);
		var ue = jquery('#users').find("#user_" + registrationResult.uid);
		u.setElement(ue);
		u.setUID(registrationResult.uid);
		var uid = registrationResult.uid;
		addToCyArray(uid);
		// We connect user object straight to the element he is managing
		userIDsToFakeUsers[uid] = u;
		ue.on('click', function(e) {
			if (jquery(e.target).prop("tagName").toUpperCase() === 'BUTTON') {
				var divEl = jquery(e.target).parents('.userel');
				var uid = divEl.attr('id').split("_")[1];
				console.log("BUTTON CLICK for " + uid);
				var choice = jquery(e.target).attr('id');
				userIDsToFakeUsers[uid].receive({tag: 'answerIn', data: choice});
			}
		});
	}

	console.log(registrationResult);
};
*/
createCY();




function buildAnswerView(uid) {
	var answerButtons = "<button id='a'>A</button><button id='b'>B</button><button id='c'>C</button><button id='d'>D</button>"
	var html =  answerButtons + "<ul class='msgUL'></ul>";
	html = "<div class='stateview waitingForAnswers' data-statename='waitingForAnswers'>" + html + "</div>";
	return html;
}

function buildStandingsView(uid) {
	var html = "<div class='stateview preparingNextQuestion' data-statename='preparingNextQuestion'>";
	html += "<ul class='standingsUL'></ul>";
	html += "</div>";
	return html;
}

function buildWaitForStartView(uid) {
	var html = "<div class='stateview waitingForStart' data-statename='waitingForStart'>";
	html += "<h1 class='registeredNum' style='text-align: center;'></h1>";
	html += "</div>";
	return html;	
}

setTimeout(function() {
	
}, 500);


var info = controller.getTournamentStatusInfo(tid);



