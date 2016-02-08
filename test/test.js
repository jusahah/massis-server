var assert = require('assert');
var controller = require('../domain/controller');

describe('Array', function() {
  describe('Access to controller', function () {
    it('should return 1 when calling controller test()', function () {
      assert.equal(1, controller.test());
    });
  });
});