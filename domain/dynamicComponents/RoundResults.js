
function RoundResults() {

	this.results = {};

	// Note that RoundResults does not care about whether userId actually is part of tournament
	// When results are merged with old standings, extra results are simply ditched as they dont 
	// transfer into new standings
}

RoundResults.prototype.addPoints = function(uid, points) {
	this.results[uid] = points;
}

RoundResults.prototype.getUserPoints = function(uid) {
	return this.results[uid];
}

module.exports = function() {
	return new RoundResults();
}