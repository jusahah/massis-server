var fs = require('fs-extra');

module.exports = {
	usersCountFile: __dirname + "/../../data/usersCount_ " + Date.now(),
	currentUserCount: 0,

	startTracking: function(testIntervalInMs) {
		testIntervalInMs = testIntervalInMs < 1000 ? 1000 : testIntervalInMs; // Make sure nobody gives too low value
		setInterval(function() {
			console.log(this.currentUserCount);
			var nowUsers = this.currentUserCount;
			var now      = Date.now();
			fs.appendFile(this.usersCountFile, nowUsers.toString() + " | " + now + "\n", 'utf8', function(err) {
				if (err) {
					console.log(err);
				}
			});
		}.bind(this), testIntervalInMs);
	},

	init: function() {
		console.log("INIT: Created users tracking file: " + this.usersCountFile);
		fs.createFileSync(this.usersCountFile);
	}
}