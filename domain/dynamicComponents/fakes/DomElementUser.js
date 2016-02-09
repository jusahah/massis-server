function DomElementUser(uid, element) {
	this.uid = uid;
	this.user;
	this.element = element;

	this.downCb;
	this.upCb;
	this.msgCb;

	this.receive = function(msg) {

		setTimeout(function() {
			console.log("Sending msg down the socket: " + this.uid);
			if (this.msgCb) this.msgCb(msg);
		}.bind(this), 0)
		
	}
	this.send = function(msg) {
		if (msg.tag === 'stateChange') {
			var newState = msg.state;
			this.changeState(newState);
		} else if (msg.tag === 'newStandings') {
			var standingsView = msg.data;
			if (!standingsView.hasOwnProperty('neighbours')) this.showNewStandingsAllInOne(standingsView);
			else this.showNewStandingsNeighbours(standingsView);
		} else if (msg.tag === 'answerEvaluated') {
			var wasCorrect = msg.data;
			this.showAnswerEvaluated(wasCorrect);
		} else if (msg.tag === 'registeredNum') {
			var num = msg.data;
			this.showRegisteredNum(num);
		} 
		//this.element.find('.msgUL').append('<li>' + JSON.stringify(msg) + '</li>');
		
	}
	this.setUID = function(uid) {
		this.uid = uid;
	}
	this.setElement = function(element) {
		this.element = element;
	}
	this.setUser = function(user) {
		this.user = user;
	}
	this.onConnectionDown = function(cb) {
		this.downCb = cb;
	}
	this.onConnectionUp = function(cb) {
		this.upCb = cb;
	}
	this.onMessage = function(cb) {
		this.msgCb = cb;
	}

	this.changeState = function(toState) {
		this.element.find('.stateview').hide();
		//alert(toState);
		console.warn(toState);
		console.log(this.element.find('.' + toState));
		this.element.find('.' + toState).show();
		this.element.find('.answerLight').css('background-color', 'yellow');

	}

	this.mergeTwoStandingsObjectsToIterableRanking = function(top5, neighs, rank) {
		// We always push five first
		var r;
		var rankingViewArr = [];
		for (var i = 1; i <= 5; i++) {
			rankingViewArr.push({type: 'user', rank: i, uid: top5[i].uid, points: top5[i].points, me: i === rank});
		};		
		if (rank >= 9) {
			// Basic case, there needs to be one ... -element in between
			rankingViewArr.push({type: 'filler'});

			for (var i = 0; i <= 4; i++) {
				var spot = neighs[i];
				if (spot) {
					r = rank + i-2;
					rankingViewArr.push({type: 'user', rank: r, uid: spot.uid, points: spot.points, me: r === rank});				
				}

			};			

		} else if (rank <= 3) {
			// We are done
			
		} else {
			// No filler
			for (var i = 0; i <= 4; i++) {
				var spot = neighs[i];
				r = rank + i-2;
				if (spot && r > 5) {
					rankingViewArr.push({type: 'user', rank: r, uid: spot.uid, points: spot.points, me: r === rank});				
				}

			};				
		}

		return rankingViewArr;
	}

	this.showNewStandingsNeighbours = function(standingsView) {

		var top5 = standingsView.top5;
		var neighs = standingsView.neighbours;
		var rank   = standingsView.yourRank;

		var rankingsArr = this.mergeTwoStandingsObjectsToIterableRanking(top5, neighs, rank);
		var ul = this.element.find('.standingsUL');
		var html = '';

		for (var i = 0, j = rankingsArr.length; i < j; i++) {
			var ranking = rankingsArr[i];
			var classLi = ranking.me ? 'me' : 'notme';
			if (ranking.type === 'user') html += "<li class='"  + classLi + "'>" + ranking.rank + ": " + ranking.uid + " (" + ranking.points + ")</li>";
			else html += "<li>...</li>";
		};
		/*
		var ul = this.element.find('.standingsUL');
		var html = '';
		for (var i = 1; i <= 5; i++) {
			var spot = top5[i];
			html += "<li>" + i + ": " + spot.uid + " (" + spot.points + ")</li>";
		};

		if (rank > 3) {
			html += "<li>...</li>";

			for (var i = 0; i <= 4; i++) {
				var spot = neighs[i];
				if (spot) {
					r = rank + i-2;
					html += "<li>" + r + ": " + spot.uid + " (" + spot.points + ")</li>";					
				}

			};			
		}
		*/
		

		//console.error("HTML BUILT: " + html);
		console.log(ul);
		ul.empty().append(html);		
	}

	this.showNewStandingsAllInOne = function(standingsView) {
		var ul = this.element.find('.standingsUL');
		var html = '';
		for (var i = 1; i <= 10; i++) {
			var spot = standingsView[i];
			if (spot) {
				var classLi = spot.uid == this.uid ? 'me' : 'notme';
				html += "<li class='"  + classLi + "'>" + i + ": " + spot.uid + " (" + spot.points + ")</li>";				
			}

		};

		//console.error("HTML BUILT: " + html);
		console.log(ul);
		ul.empty().append(html);
	}

	this.showAnswerEvaluated = function(wasCorrect) {
		var answerLight = this.element.find('.answerLight');
		if (wasCorrect) answerLight.css('background-color', 'green');
		else answerLight.css('background-color', 'red');

	}

	this.showRegisteredNum = function(num) {
		this.element.find('.registeredNum').empty().append(num);
	}

	this.tournamentEnded = function(standingsView) {

	}
}











/// Alternative to DOMUserElement
// Follows same API
function CytoUser(cytoController, tid) {
	this.cytoController = cytoController;
	this.tid = tid;
	this.uid
	this.user;
	this.element

	this.downCb;
	this.upCb;
	this.msgCb;

	this.receive = function(msg) {

			console.log("Sending msg down the socket: " + this.uid);
			this.cytoController.msgReceived(this.uid, this.tid);
			if (this.msgCb) this.msgCb(msg);
		
		
	}
	this.send = function(msg) {
		setTimeout(function() {
			this.cytoController.msgSent(this.uid, this.tid);
		}.bind(this), 150)
		if (msg.tag === 'stateChange') {
			var newState = msg.state;
			this.changeState(newState);
		} else if (msg.tag === 'newStandings') {
			var standingsView = msg.data;
			if (!standingsView.hasOwnProperty('neighbours')) this.showNewStandingsAllInOne(standingsView);
			else this.showNewStandingsNeighbours(standingsView);
		} else if (msg.tag === 'answerEvaluated') {
			var wasCorrect = msg.data;
			this.cytoController.answerEvaluated(this.uid, wasCorrect);
			this.showAnswerEvaluated(wasCorrect);
		} else if (msg.tag === 'registeredNum') {
			var num = msg.data;
			this.showRegisteredNum(num);
		} 
		//this.element.find('.msgUL').append('<li>' + JSON.stringify(msg) + '</li>');
		
	}
	this.setUID = function(uid) {
		this.uid = uid;
	}
	this.setElement = function(element) {
		this.element = element;
	}
	this.setUser = function(user) {
		this.user = user;
	}
	this.onConnectionDown = function(cb) {
		this.cytoController.connectionDown(this.uid, this.tid);
		this.downCb = cb;
	}
	this.onConnectionUp = function(cb) {
		this.cytoController.connectionUp(this.uid, this.tid);
		this.upCb = cb;
	}
	this.onMessage = function(cb) {
		this.msgCb = cb;
	}

	this.changeState = function(toState) {

		this.cytoController.stateChange(this.uid, toState);
		// Fake answering
		if (toState === 'waitingForAnswers') {
			setTimeout(this.fakeAnswer.bind(this), 1000+Math.random()*4000);
		}
		

	}

	this.fakeAnswer = function() {
		var r = Math.random();
		var choice = 'd';
		if (r < 0.25) choice = 'a';
		else if (r > 0.25 && r < 0.50) choice = 'b';
		else if (r > 0.50 && r < 0.75) choice = 'c';
		this.receive({tag: 'answerIn', data: choice});
	}


	this.mergeTwoStandingsObjectsToIterableRanking = function(top5, neighs, rank) {
		
	}

	this.showNewStandingsNeighbours = function(standingsView) {
		
	}

	this.showNewStandingsAllInOne = function(standingsView) {
		
	}

	this.showAnswerEvaluated = function(wasCorrect) {
		
	}

	this.showRegisteredNum = function(num) {
	
	}

	this.tournamentEnded = function(standingsView) {

	}	


}
module.exports   = CytoUser;
//module.exports = DomElementUser;