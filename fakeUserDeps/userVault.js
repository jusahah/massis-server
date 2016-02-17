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
	'pekka99513': false,
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
	'pekka600': false,
	'pekka601': false,
	'pekka602': false,
	'pekka613': false,
	'pekka614': false,
	'pekka615': false,
	'pekka616': false,
	'pekka617': false,
	'pekka618': false,
	'pekka619': false,
	'pekka621': false,
	'pekka622': false,
	'pekka623': false,
	'pekka624': false,
	'pekka625': false,
	'pekka626': false,
	'pekka627': false,
	'pekka628': false,	
	'pekka700': false,
	'pekka701': false,
	'pekka702': false,
	'pekka713': false,
	'pekka714': false,
	'pekka715': false,
	'pekka716': false,
	'pekka717': false,
	'pekka718': false,
	'pekka719': false,
	'pekka721': false,
	'pekka722': false,
	'pekka723': false,
	'pekka724': false,
	'pekka725': false,
	'pekka726': false,
	'pekka727': false,
	'pekka728': false,
	'pekka800': false,
	'pekka801': false,
	'pekka802': false,
	'pekka813': false,
	'pekka814': false,
	'pekka815': false,
	'pekka816': false,
	'pekka817': false,
	'pekka818': false,
	'pekka819': false,
	'pekka821': false,
	'pekka822': false,
	'pekka823': false,
	'pekka824': false,
	'pekka825': false,
	'pekka826': false,
	'pekka827': false,
	'pekka828': false,	

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