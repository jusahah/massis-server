var socketCreator = require("socket.io-client");
var http   = require('http');
var Hapi = require('hapi');

// App deps
var allUsers = require('./fakeUserDeps/userVault');

var server = new Hapi.Server();
server.connection({ port: 8071});

var cheatingSystem = new CheatingSystem();
//var oddsSystem     = require('./fakeUserDeps/oddsSystem');

var idsToHelpers = {};
var sockets = [];

/*
server.route({
	method: 'POST',
	path: '/newtournament',
	handler: function(request, reply) {
		console.log("REQUEST IN");
		console.log(request.payload.info);
		console.log(request.payload.odds);

		var tournamentInfo = JSON.parse(request.payload.info);
		var oddsInfo       = JSON.parse(request.payload.odds);
		console.log("Tournament info is server route");
		console.log(tournamentInfo);
		oddsSystem.addOdds(oddsInfo);
		cheatingSystem.add(tournamentInfo);
		reply('ok');
	}
});
*/
server.start(function() {
	console.log("SERVER RUNNING: " + server.info.uri);
	setTimeout(function() {
		console.log("STARTING PARTICIPANTS REGISTER");
		cheatingSystem.startRegisteringParticipants(28);
	}.bind(this), 2000);
});

function CheatingSystem() {

	this.add = function(tournamentInfo) {
		console.log("TOURNAMENT INFO IN CHEATING SYSTEM ADD");
		console.log(tournamentInfo);

		var id = tournamentInfo.id;
		var questionHelpers = tournamentInfo.helpers;

		idsToHelpers[id] = questionHelpers;
		console.log("...........................................");
		console.log("--------PARTICIPANTS REGISTER STARTS-------")
		this.startRegisteringParticipants(id);

	}

	this.tournamentEnded = function(id) {

	}

	this.startRegisteringParticipants = function(tid) {
		for (var i = 30; i >= 0; i--) {
			setTimeout(function() {
				var s = socketCreator('http://localhost:8079', {'force new connection': true});
				sockets.push(s);	
				s.on('provideInfo', function() {
					var userName = allUsers.getFreeName();
					console.log("------------------------------NAME CHOSEN: " + userName + " ----------------");
					s.emit('TidAndName', {tid: tid, name: userName});
				});
				s.on('fromServer', function(msg) {
					if (msg.tag === 'newQuestion') {
						var question = msg.data;
						var questionText = question.question;
						setTimeout(function() {
							var choice = 'd';
							var r = Math.random();
							if (r < 0.25) choice = 'a';
							else if (r < 0.5) choice = 'b';
							else if (r < 0.75) choice = 'c';

							s.emit('fromClient', {tag: 'answerIn', data: choice});
						}, Math.random()*10000+1000);
					}
				});

			}, i * 200);


		};
	}

}



