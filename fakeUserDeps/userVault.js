var _ = require('lodash');
var users = {
	'pekka1': false,
	'pekka2': false,
	'pekka3': false,
	'pekka4': false,
	'pekka5': false,
	'pekka6': false,
	'pekka7': false,
	'pekka8': false,
	'pekka9': false,
	'pekka10': false,
	'pekka11': false,
	'pekka12': false,
	'pekka513': false,
	'pekka52': false,
	'pekka53': false,
	'pekka54': false,
	'pekka55': false,
	'pekka56': false,
	'pekka57': false,
	'pekka58': false,
	'pekka59': false,
	'pekka500': false,
	'pekka501': false,
	'pekka502': false,
	'pekka513': false,
	'pekka514': false,
	'pekka515': false,
	'pekka516': false,
	'pekka517': false,
	'pekka518': false,
	'pekka519': false,
	'pekka521': false,
	'pekka522': false,
	'pekka523': false,
	'pekka524': false,
	'pekka525': false,
	'pekka526': false,
	'pekka527': false,
	'pekka528': false,

};

module.exports = {
	getFreeName: function() {

		var freeNames = [];

		_.forOwn(users, function(isPlaying, username) {
			if (!isPlaying) freeNames.push(username);
		})

		var l = freeNames.length;
		var chosenName = freeNames[Math.floor(l*Math.random())];
		users[chosenName] = true;

		return chosenName;

	},
	returnUsedName: function(name) {
		if (users.hasOwnProperty(name)) {
			users[name] = false;
		}
	}

}