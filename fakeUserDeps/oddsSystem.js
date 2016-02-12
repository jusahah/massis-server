var _ = require('lodash');

var questionsRegistered = {};

module.exports = {
	addOdds: function(oddsInfo) {
		_.forOwn(oddsInfo, function(value, key) {
			questionsRegistered[key] = value;
		});
	},
	getOdds: function(questionText) {
		if (questionsRegistered.hasOwnProperty(questionText)) {
			return questionsRegistered[questionText];
		} return {
			a: 0.25,
			b: 0.25,
			c: 0.25,
			d: 0.25
		}
	}
}