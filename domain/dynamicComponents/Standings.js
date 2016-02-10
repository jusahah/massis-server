function Standings(userIDs, rankings, userIDToRanking, setByMerger) {
	this.setByMerger = setByMerger;
	this.userIDs = userIDs; // Array of users participating this standings object (and thus tournament)

	this.rankings = rankings; // Layout: [{uid, points}, {uid, points}, ... {uid, points}]

	// Note that in userIDToRanking the "_" character works as a separator!!
	this.userIDToRanking = userIDToRanking; // Layout: {uid: ranking_points, uid: ranking_points} 

	this.init();
}

Standings.prototype.init = function() {
		if (this.setByMerger) return; // Already setup by merger
		// Randomize rankings at the beginning
		this.rankings = [];
		this.userIDToRanking = {};
		for (var i = 0, j = this.userIDs.length; i < j; i++) {
			var uid = this.userIDs[i];
			this.rankings.push({uid: uid, points: 0});
			this.userIDToRanking[uid] = (i+1) + "_" + 0;
		};
		console.log(this.rankings);
		console.log(this.userIDToRanking);
}

Standings.prototype.finalStandings = function() {
	return this.rankings;
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

Standings.prototype.getUserIDToRankingPoints = function(uid) {
	return this.userIDToRanking[uid];
}

// Get ranking by uid
Standings.prototype.getCurrentRanking = function(uid) {
	var res = this.userIDToRanking[uid];
	if (!res) return undefined;
	return parseInt(res.split('_')[0]);
}
// Get uid by ranking
Standings.prototype.getNth = function(n) {
	if (n > this.rankings.length || n < 1) return undefined;
	return this.rankings[n-1];
}

module.exports = function(userIDs, rankings, userIDToRanking, setByMerger) {
	return new Standings(userIDs, rankings, userIDToRanking, setByMerger);
}