// Merges Standings with RoundResults
var Standings = require('./Standings');

function buildWhenTenOrUnderUsers(uids, standings, roundResults) {
	var newPoints = [];

	for (var i = uids.length - 1; i >= 0; i--) {
		var uid = uids[i];
		console.log("UID: " + uid)
		var cp = parseInt(standings.getUserIDToRankingPoints(uid).split("_")[1]); // Latter part is the points
		var up = roundResults.getUserPoints(uid);
		if (!up) up = 0; // No change in player points
		newPoints.push({uid: uid, points: cp+up});
	};

	console.log("NEW POINTS IN BUILDER");
	console.log(newPoints);

	newPoints.sort(function(a, b) {
		if (a.points > b.points) return -1;
		if (a.points < b.points) return 1;
		return 0; 
	});	
	var topX = {};
	var userIDToRanking = {};
	var standingsViews  = {};

	for (var i = 0, j = newPoints.length; i < j; i++) {
		var o = newPoints[i];
		userIDToRanking[o.uid] = (i+1) + "_" + o.points;
		standingsViews[o.uid] = topX; // Everybody sees same view because so few players
		topX[i+1] = o;
	}

	return {
		'standings': Standings(uids, newPoints, userIDToRanking, true),
		'standingsViews': standingsViews
	} 
}

// Should be run on separate process/thread!
function StandingsMerger(standings, roundResults) {
	var uids = standings.getUsers();
	var newPoints = [];

	if (uids.length <= 10) {
		// We use different function to build this all
		return buildWhenTenOrUnderUsers(uids, standings, roundResults);
	}

	// This is somewhat performance critical so we use optimized for-loop
	for (var i = uids.length - 1; i >= 0; i--) {
		var uid = uids[i];
		var cp = parseInt(standings.getUserIDToRankingPoints(uid).split("_")[1]); // Latter part is the points
		var up = roundResults.getUserPoints(uid);
		if (!up) up = 0; // No change in player points
		newPoints.push({uid: uid, points: cp+up});
	};

	// newPoints now contains full user list with new total points for each
	// Now we need to calc rankings
	// First sort
	newPoints.sort(function(a, b) {
		if (a.points > b.points) return -1;
		if (a.points < b.points) return 1;
		return 0; 
	});

	var userIDToRanking = {};
	var standingsViews  = {};
	var newRankings     = newPoints;

	var topFive = {
		1: newRankings[0],
		2: newRankings[1],
		3: newRankings[2],
		4: newRankings[3],
		5: newRankings[4]
	}


	// Following is pretty naive algorithm -> improve if performance problems arise
	for (var i = 0, j = newPoints.length; i < j; i++) {
		var o = newPoints[i];
		var uid2 = o.uid;
		userIDToRanking[uid2] = (i+1) + "_" + o.points;
		standingsViews[uid2] = {};
		standingsViews[uid2].top5 = topFive;
		standingsViews[uid2].neighbours = {};
		standingsViews[uid2].yourRank = (i+1);

		if (i-2 >= 0) {
			standingsViews[uid2].neighbours[0] = newPoints[i-2];
		} 
		if (i-1 >= 0) {
			standingsViews[uid2].neighbours[1] = newPoints[i-1];
		}
		standingsViews[uid2].neighbours[2] = o; // Oneself is at the middle

		if (i+1 < j) {
			standingsViews[uid2].neighbours[3] = newPoints[i+1];
		} 
		if (i+2 < j) {
			standingsViews[uid2].neighbours[4] = newPoints[i+2];
		}

		// Now build standingsview
	};

	// newPoints is now sorted

	// Rankings layout: [{uid, points}, {uid, points}, ... {uid, points}]
	// UserIdToRanking: {uid: ranking_points, uid: ranking_points, ..., uid: ranking_points} 

	return {
		'standings': Standings(uids, newRankings, userIDToRanking, true),
		'standingsViews': standingsViews
	}

}


module.exports = StandingsMerger; // Note that this is a pure function