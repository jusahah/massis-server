function Standings(userIDs, rankings, userIDToRanking) {
	this.userIDs = userIDs; // Array of users participating this standings object (and thus tournament)

	this.rankings = rankings || []; // Layout: [{uid, points}, {uid, points}, ... {uid, points}]
	
	// Note that in userIDToRanking the "_" character works as a separator!!
	this.userIDToRanking = userIDToRanking || {}; // Layout: {uid: ranking_points, uid: ranking_points} 
}

Standings.prototype.getUsers = function() {
	return this.userIDs;
}
Standings.prototype.getRankings = function() {
	return this.rankings;
}
Standings.prototype.getUserIDToRanking = function() {
	return this.userIDToRanking;
}

Standings.prototype.getUsersAmount = function() {
	return this.userIDs.length;
}

// Get ranking by uid
Standings.prototype.getCurrentRanking = function(uid) {
	this.userIDToRanking[uid];
}
// Get uid by ranking
Standings.prototype.getNth = function(n) {
	if (n > this.rankings.length) return undefined;
	return this.rankings[n-1];
}

module.exports = function(userIDs) {
	return new Standings(userIDs);
}