var request = require('request');

module.exports = {

	pushTournamentInfo: function(laravelApiKey, info) {
		console.log("PUSHING TOURNEY INFO AWAY");
		console.log(info);
		request({
			url: 'http://localhost/massis_laravel/massis/public/api/donetournaments',
			method: 'POST',
			form: {key: laravelApiKey, info: info}
		}, function(error, response, body) {
			console.log("RETURN FROM TOURNAMENT INFO SAVING");
			console.log(response.statusCode);
			console.log(body);
			if (response.statusCode == 200) {
				console.log("pushTournamentInfo to QUEUE successfull");
								
			}


		});		
	}
	
}