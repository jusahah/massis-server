// Communication implementation is socket.io
var packageJSON = require('./package.json'); // We need to get server key from here

var _ = require('lodash');
var io = require('socket.io')();
var SocketWrapper = require('./technical/internet/SocketWrapper');
var userCountTracker = require('./technical/disk/UsersTracker');
var countBroadcaster = require('./technical/internet/broadcastUserCount');
var tournamentFetcher = require('./technical/internet/tournamentFetcher');
var queuePusher       = require('./technical/internet/queuePusher');
var idsToUsers = require('./domain/staticComponents/userIDsToUsers');
// Domain layer entry point
var controller = require('./domain/controller');
var msgSink    = require('./domain/msgSink');

msgSink.setController(controller);
msgSink.setUsersTable(idsToUsers);

////
////
// CONFIGS PART BEGINS
////
////

// Later move these into conf file
var SOCKET_PORT = 8079; // Port socket.io is listening
var MAX_USERS_ON_SERVER = 1000; // After this many users new sockets are denied
var LARAVEL_KEY = 'visamestari'; // Encrypt in production
var SERVER_KEY  = packageJSON.serverkey;

var FETCHING_INTERVAL = 3 * 1000; // How often we fetch new tournaments from Laravel endpoint
var MY_IP_ADDRESS     = 'localhost:8079' // Own address to be sent to Laravel endpoint when fetching

////
////
// CONFIGS PART ENDS
////
////


// Init deps (sync way)

///
console.log("INIT: userCountTracker");
userCountTracker.init();
userCountTracker.startTracking(1000*60); // Once every 1 min write users count to a file
///

///
console.log("INIT: Tournament fetcher");
var fetcher = tournamentFetcher(MY_IP_ADDRESS, LARAVEL_KEY, function(tournaments) {
	_.each(tournaments, function(t) {
		// Pass to controller
		// We need to transform them a bit
		t.startsAt = t.startsAt * 1000; // To milliseconds

		console.log("---- STARTS IN: " + (t.startsAt - Date.now()) + " ms");
		_.each(t.questions, function(question) {
			question.choices = {};
			question.choices.a = question.a;
			question.choices.b = question.b;
			question.choices.c = question.c;
			question.choices.d = question.d;
		});
		var domainTid = controller.addTournament(t);
		tidsToDomainTids[t.id] = domainTid;
		console.log("ADDING TO DOMAIN TIDS MAPPING: " + t.id + " -> " + domainTid);
	});
});
fetcher.startFetching(FETCHING_INTERVAL);
///
countBroadcaster.setServerKey(SERVER_KEY);
countBroadcaster.startBroadcasting(LARAVEL_KEY, 1000*30*1); // Once every 30 secs

///
/// Tell controller that he must tell somebody when tournaments are so done
controller.whenTournamentDone(function(tournamentFinalInfo) {
	console.log("Tournament done msg received in tech layer: " + tournamentFinalInfo);
	console.log(tournamentFinalInfo);
	queuePusher.pushTournamentInfo(LARAVEL_KEY, tournamentFinalInfo);
})
///


// Note that disconnections are handled purely here on technical layer
// When disconnection occurs domain-layer is informed straight through API method controller.userLeft(uid)
function createDisconnectingListener(socket, uid) {
	socket.on('disconnect', function() {
		--userCountTracker.currentUserCount;
		var res = controller.userLeft(uid);
		if (!res) {
			console.error('Warning in disconnecting socket: controller.userLeft() -> false: ' + uid);
		}
	});
}

io.on('connection', function(socket) {
	if (userCountTracker.currentUserCount > MAX_USERS_ON_SERVER) {
		socket.disconnect();
		return false;
	}
	console.log("SOCKET CONN");
	socket.emit('provideInfo');
	console.log("Provide info sent!");
	socket.on('TidAndName', function(data) {
		console.log("TID AND NAME REC: " + data.tid + ", " + data.name);
		var tid  = data.tid;
		var domainTid = tidsToDomainTids[tid];
		var name = data.name;
		// Client has now completed initialization
		// We contact domain layer with creation of new user
		// First we create necessary abstractions to pass into domain
		var sw = new SocketWrapper(socket); // Inits rest of socket listeners etc
		var result = controller.userJoined(name, domainTid, sw); // Kicks off the domain-layer initialization

		// rif error in domain layer  -> result is {success: false, reason: 'some reason'}
		// if all went fine in domain -> result is {success: true, uid: 123456, tid: tid}
		if (result && result.success) {
			// Life is good
			socket.emit('joinedtotournament', {tid: domainTid, info: result.info});
			// Do nothing, rest of communication is from User object towards SocketWrapper
			console.log("User joined: " + domainTid + ", " + result.uid);
			// Only now we create disconnecting listener as we suddenly started caring about this client
			createDisconnectingListener(socket, result.uid);
			++userCountTracker.currentUserCount;
		} else {
			// Something failed so miserably
			console.error('User join failed: ' + domainTid + ", " + result.reason);
			// Inform poor socket that he is a failure and will always be
			socket.emit('youfail', {reason: result.reason});
		}
	})
	

});


io.listen(SOCKET_PORT);

var tidsToDomainTids = {};

var domainTid;
setTimeout(function() {
	return;
	var tid = 2;

	domainTid = controller.addTournament({
		id: tid,
		maxPlayers: 30,
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
				odds: {
					a: 65,
					b: 10,
					c: 20,
					d: 5
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
				odds: {
					a: 65,
					b: 10,
					c: 20,
					d: 5
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
				odds: {
					a: 65,
					b: 10,
					c: 20,
					d: 5
				},
				answer: 'a',		
			},
			{
				question: "Capital of Botswana2?",
				choices: {
					a: "Gaborone",
					b: "Gatorade",
					c: "Pepsodent",
					d: "Red Bull"
				},
				odds: {
					a: 5,
					b: 10,
					c: 20,
					d: 65
				},
				answer: 'a',		
			},
			{
				question: "Capital of Botswana3?",
				choices: {
					a: "Gaborone",
					b: "Gatorade",
					c: "Pepsodent",
					d: "Red Bull"
				},
				odds: {
					a: 15,
					b: 60,
					c: 20,
					d: 5
				},
				answer: 'a',		
			}
			
		],
		timeToAnswer: Math.floor(Math.random()*2000) + 10000,
		timeBetweenQuestions: 15000 + Math.floor(Math.random()*2000),
		startsAt: Date.now() + 30 * 1000
	});

	tidsToDomainTids[tid] = domainTid;

}, 600);

/*
setTimeout(function() {

	controller.userJoined('pekka55', domainTid, new DomElementUser2());

}, 1200);
setTimeout(function() {

	controller.userJoined('pekka7755', domainTid, new DomElementUser2());

}, 1400);
*/
function DomElementUser2(uid, element) {

	this.receive = function(msg) {

		
	}
	this.send = function(msg) {

		
	}
	this.setUID = function(uid) {
		this.uid = uid;
	}
	this.setElement = function(element) {
		this.element = element;
	}
	this.setUser = function(user) {
		this.user = user;
	}
	this.onConnectionDown = function(cb) {
		this.downCb = cb;
	}
	this.onConnectionUp = function(cb) {
		this.upCb = cb;
	}
	this.onMessage = function(cb) {
		this.msgCb = cb;
	}

	this.changeState = function(toState) {


	}

	this.mergeTwoStandingsObjectsToIterableRanking = function(top5, neighs, rank) {


	}

	this.showNewStandingsNeighbours = function(standingsView) {


	}

	this.showNewStandingsAllInOne = function(standingsView) {

	}

	this.showAnswerEvaluated = function(wasCorrect) {

	}

	this.showRegisteredNum = function(num) {

	}

	this.tournamentEnded = function(standingsView) {

	}
}
