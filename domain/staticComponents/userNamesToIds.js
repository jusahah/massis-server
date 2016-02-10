
var namesToIDs = {};
var IDsToNames = {};

module.exports = {

	checkNameAvailability: function(name) {
		return namesToIDs.hasOwnProperty(name) === false;
	},
	registerName: function(name, uid) {
		namesToIDs[name] = uid;
		IDsToNames[uid] = name;
	},
	getNameByID: function(uid) {
		return IDsToNames[uid];
	},
	getIDByName: function(name) {
		return namesToIDs[name];
	},
	removeNameID: function(name, uid) {
		var nameRemoved = false;
		var IDRemoved   = false;
		if (namesToIDs.hasOwnProperty(name)) {
			delete namesToIDs[name];
			nameRemoved = true;
		}
		if (IDsToNames.hasOwnProperty(uid)) {
			delete IDsToNames[uid];
			IDRemoved = true;
		}

		// check if asymmetrical deletions
		if (nameRemoved !== IDRemoved) {
			// Something fishy
			console.error("NAME-ID REMOVAL FROM NAMES_TO_IDS_TABLE: Asymmetrical removal occurred: " + name + ", " + uid);
		}
		return true;
	}

}