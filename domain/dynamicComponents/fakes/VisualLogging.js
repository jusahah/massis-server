// Helps visually see whats going on inside Tournament
var jquery = require('jquery');

function VisualLogger(name) {

	this.name = name; // Tournament name
	this.elementID;
	this.el;

	this.init = function() {
		this.elementID = "tournament_" + Math.floor(Math.random()*1000*1000*1000);
		var html = "<div class='tournamentel' id='" + this.elementID + "'><h3>" + this.name + "</h3><ul class='msgUL'></ul></div>"; 
		jquery('#tournamentArea').append(html);
		this.el = jquery('#tournamentArea').find('#' + this.elementID);
		console.warn("INITED VISUAL LOGGING FOR Tournament");
	}


	this.msgFromPlayer = function(uid, msg) {
		console.warn("MSG TO VISUAL: " + msg);
		this.el.find('.msgUL').append('<li style="color: black;">' + uid + ": " + JSON.stringify(msg) + "</li>");
	}

	this.infoMsg = function(msg) {
		console.warn("INFO MSG: " + msg);
		this.el.find('.msgUL').append('<li style="color: purple;">' + msg + '</li>');
	}

	this.init();
}

module.exports = VisualLogger;