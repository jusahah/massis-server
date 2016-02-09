var User = require('../dynamicComponents/User');

var usersTable = {};
var idCounter = 1;

module.exports = {
	getUser: function(uid) {
		if (usersTable.hasOwnProperty(uid)) {
			return usersTable[uid];
		}
		return null;
	},
	createUser: function(msgMechanism) {
		// MsgMechanism is socket connected to user
		// Decides user ID 
		++idCounter;
		var id = parseInt(Date.now().toString() + idCounter.toString()); 
		usersTable[id] = User(id, msgMechanism);
		return id;
	},
	getListOfUsers: function(userIDs) {
		var users = [];
		for (var i = userIDs.length - 1; i >= 0; i--) {
			var user = usersTable[userIDs[i]];
			if (user) users.push(user); // Only push those who are still online
		};

		return users;
	},
	removeUser: function(id) {
		if (id) {
			delete usersTable[id];
		}
		return true;
	}
}