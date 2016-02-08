(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
	Provides high-level facace API for accessing domain layer and its services
*/


module.exports = {
	test: function() {
		return 1;
	},
	addTournament: function(tournamentData) {
		// Consider validation data object with Joi
		var name = tournamentData.name;
		var startingTime = tournamentData.startingTime;
		var questions    = tournamentData.questions;
		var maxPlayers   = tournamentData.maxPlayers;
		var description  = tournamentData.description;

	}

}


},{}],2:[function(require,module,exports){

// For now this is mostly for testing
var controller = require('./controller');


console.log(controller.test());


},{"./controller":1}]},{},[2]);
