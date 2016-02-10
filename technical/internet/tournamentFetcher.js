var request = require('request-json');
var laravel = request.createClient('http://localhost:8888/'); // Laravel address goes here

module.exports = function(ownIP, tournamentsFoundCb) {
	var fetchIntervalHandle;
	var fetch = function() {
		laravel.get('tournaments/', function(err, res, body) {
			if (err) return;
			var tournaments = body.rows[0].tournaments;

			if (tournaments.length !== 0) {
				// Send to whoever provided callback
				tournamentsFoundCb(tournaments);	
				console.log("TOURNAMENTS RECEIVED: " + tournaments.length);			
			} else {
				console.log("NO TOURNAMENTS RECEIVED");
			}

		});
	};

	var startFetching = function(fetchInterval) {
		// First fetch in two secs
		fetchInterval = fetchInterval < 10000 ? 10000 : fetchInterval;
		setTimeout(function() {
			fetchIntervalHandle = setInterval(fetch, fetchInterval);
		}, 2000);
		
	} 

	var stopFetching = function() {
		if (fetchIntervalHandle) {
			clearInterval(fetchIntervalHandle);
			fetchIntervalHandle = null;
		}
	}

	return {
		fetch: fetch,
		startFetching: startFetching,
		stopFetching: stopFetching
	}

}