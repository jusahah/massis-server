var request = require('request');
//var laravel = request.createClient('http://localhost/massis_laravel/massis/public/'); // Laravel address goes here

module.exports = function(ownIP, laravelApiKey, tournamentsFoundCb) {
	var fetchIntervalHandle;
	var fetch = function() {
		console.log("SENDING FETCH: " + laravelApiKey + ", " + ownIP);
		request({
			url: 'http://localhost/massis_laravel/massis/public/api/tournaments',
			method: 'POST',
			form: {key: laravelApiKey, me: ownIP}
		}, function(error, response, body) {
			console.log(response.statusCode);
			console.log(body);
			if (response.statusCode == 200) {
				var tournaments = JSON.parse(body);

				if (tournaments.length !== 0) {
					// Send to whoever provided callback
					console.log("TOURNAMENTS RECEIVED: " + tournaments.length);	
					tournamentsFoundCb(tournaments);	
							
				} else {
					console.log("NO TOURNAMENTS RECEIVED");
				}				
			}


		});
	};

	var startFetching = function(fetchInterval) {
		// First fetch in two secs
		fetchInterval = fetchInterval < 10000 ? 2000 : fetchInterval;
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