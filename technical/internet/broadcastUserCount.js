var controller = require('../../domain/controller');
var request = require('request');

module.exports = {
	handle: null, 
	laravelApiKey: null,

	startBroadcasting: function(laravelApiKey, interval) {
		this.laravelApiKey = laravelApiKey;
		console.log("BROADCAST USER COUNT: ON");
		if (this.handle) return false;
		interval = interval < 10000 ? 10000 : interval;
		this.handle = setInterval(function() {
			this.getAndSendUserCount();
		}.bind(this), interval);
	},
	stopBroadcasting: function() {
		if (this.handle) {
			clearInterval(this.handle);
			this.handle = null;
		}
	},
	getAndSendUserCount: function() {
		var c = controller.getCurrentUserCount();
		console.log("PUSHING NEW USER COUNT TO LARAVEL");
		request({
			url: 'http://localhost/massis_laravel/massis/public/api/usercount',
			method: 'POST',
			form: {key: this.laravelApiKey, usercount: c}
		}, function(error, response, body) {
			console.log("RETURN FROM TOURNAMENT USER COUNT SAVING");
			console.log(response.statusCode);
			console.log(body);
			if (response.statusCode == 200) {
				console.log("push user count to server successfull");
								
			}


		});	
	}
}