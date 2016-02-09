// Unfortunately we need this fake joi validation as real one fails to work in browsers

function FakeJoi() {
	this.object = function() {
		return this;
	}
	this.string = function() {
		return this;
	}
	this.keys = function() {
		return this;
	}
	this.max = function() {
		return this;
	}
	this.min = function() {
		return this;
	}
	this.array = function() {
		return this;
	}
	this.required = function() {
		return this;
	}
	this.number = function() {
		return this;
	}
	this.integer = function() {
		return this;
	}
	this.validate = function(a, b, cb) {
		cb(null, null);
		return true;
	}
}

module.exports = new FakeJoi();