
// For now this is mostly for testing
// REQUIRING THIS ALLOW AUTORELOAD OF TESTS
var tests = require('../test/test.js');
var controller = require('./controller');
var Question = require('./dynamicComponents/Question');
var Scorer = require('./dynamicComponents/Scorer');
var QuestionVault = require('./dynamicComponents/QuestionVault');

console.log(QuestionVault);
console.log(Question);
console.log(Scorer);
console.log(controller.test());

