// Note - can not require controller because that would be circular hell
//var idsToUsers = require('./staticComponents/userIDsToUsers');
var _ = require('lodash');

module.exports = {
	controller: null,
	idsToUsers: null,
	// Sends same msg to bunch of clients
	informUniformly: function(userIDs, msg) {
		var users = this.idsToUsers.getListOfUsers(userIDs);
		// Users who have already left were not included to the users array
		_.each(users, function(user) {
			user.send(msg);
		});
		
	},
	informUser: function(uid, msg) {
		var user = this.idsToUsers.getUser(uid);
		// Need to check if the user has already left
		if (user) {
			user.send(msg);
		}
	},
	// From layer component to another
	msgToController: function(msg) {
		this.controller.msgFromComponent(msg);


	},
	setController: function(controller) {
		console.log("MSG SINK: Controller set!")
		this.controller = controller;

	},
	setUsersTable: function(idsToUsers) {
		this.idsToUsers = idsToUsers;
	}
}