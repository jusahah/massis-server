var request = require('request-json');
var laravel = request.createClient('http://localhost:8888/'); // Laravel address

module.exports = function(ownIP, tournamentsFoundCb) {

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
			setInterval(fetch, fetchInterval);
		}, 2000);
		
	} 

	return {
		fetch: fetch,
		startFetching: startFetching
	}

}