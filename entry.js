// Communication implementation is socket.io
var _ = require('lodash');
var io = require('socket.io')();
var SocketWrapper = require('./technical/internet/SocketWrapper');
var userCountTracker = require('./technical/disk/UsersTracker');
var tournamentFetcher = require('./technical/internet/tournamentFetcher');
var queuePusher       = require('./technical/internet/queuePusher');
// Domain layer entry point
var controller = require('./domain/controller');

////
////
// CONFIGS PART BEGINS
////
////

// Later move these into conf file
var SOCKET_PORT = 8079; // Port socket.io is listening
var MAX_USERS_ON_SERVER = 1000; // After this many users new sockets are denied
var LARAVEL_KEY = 'visamestari'; // Encrypt in production

var FETCHING_INTERVAL = 30 * 1000; // How often we fetch new tournaments from Laravel endpoint
var MY_IP_ADDRESS     = // Own address to be sent to Laravel endpoint when fetching

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
		controller.addTournament(t);
	});
});
tournamentFetcher.startFetching(FETCHING_INTERVAL);
///

///
/// Tell controller that he must tell somebody when tournaments are so done
controller.whenTournamentDone(function(tournamentFinalInfo) {
	console.log("Tournament done msg received in tech layer: " + tournamentFinalInfo.tid);
	queuePusher.pushTournamentInfo(tournamentFinalInfo);
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
	socket.send('provideInfo', ['tid', 'username']);
	socket.on('TidAndName', function(data) {
		var tid  = data.tid;
		var name = data.name;
		// Client has now completed initialization
		// We contact domain layer with creation of new user
		// First we create necessary abstractions to pass into domain
		var sw = new SocketWrapper(socket); // Inits rest of socket listeners etc
		var result = controller.userJoined(name, tid, sw); // Kicks off the domain-layer initialization

		// rif error in domain layer  -> result is {success: false, reason: 'some reason'}
		// if all went fine in domain -> result is {success: true, uid: 123456, tid: tid}
		if (result && result.success) {
			// Life is good
			socket.emit('joinedtotournament', {tid: tid});
			// Do nothing, rest of communication is from User object towards SocketWrapper
			console.log("User joined: " + tid + ", " + result.uid);
			// Only now we create disconnecting listener as we suddenly started caring about this client
			createDisconnectingListener(socket, result.uid);
			++userCountTracker.currentUserCount;
		} else {
			// Something failed so miserably
			console.error('User join failed: ' + tid + ", " + result.reason);
			// Inform poor socket that he is a failure and will always be
			socket.emit('youfail', {reason: result.reason});
		}
	})
	

});


io.listen(SOCKET_PORT);



