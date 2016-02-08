var assert = require('assert');

// Deps from app
var controller = require('../domain/controller');
var Question   = require('../domain/dynamicComponents/Question');
var QuestionVault = require('../domain/dynamicComponents/QuestionVault');
var Scorer     = require('../domain/dynamicComponents/Scorer');
var RoundResults = require('../domain/dynamicComponents/RoundResults');
var Standings    = require('../domain/dynamicComponents/Standings');


describe('Dynamic components tests', function() {

  // QUESTION	
  describe('Question object', function () {
    it('should validate correctly', function () {
	  	var question1 = Question({
	  		question: "", // Question missing
	  		choices: {
	  			a: "Helsinki",
	  			b: "Tukholma",
	  			c: "Porvoo",
	  			d: "Sydney"
	  		},
	  		answer: 'a'
	  	});    	
      assert.equal('question', question1.isQuestionInvalid());
	  	var question2 = Question({
	  		question: "Capital of Finland?",
	  		choices: "a=1, b=2, c=3, d=4", // Choices is not map
	  		answer: 'a'
	  	});    	
      assert.equal('choices', question2.isQuestionInvalid());  
	  	var question3 = Question({
	  		question: "Capital of Finland?",
	  		choices: {
	  			a: "Helsinki",
	  			b: "Tukholma",
	  			c: "Porvoo"
	  		}, 
 			// Answer missing
	  	});    	
      assert.equal('answer', question3.isQuestionInvalid()); 
	  	var question5 = Question({
	  		question: "Capital of Finland?",
	  		choices: {
	  			a: "Helsinki",
	  			b: "Tukholma",
	  			c: "Porvoo",
	  			d: "Sydney"
	  		},
	  		answer: 'a'
	  	});    	
      assert.equal(false, question5.isQuestionInvalid());                     
    });  	
    it('should save question text', function () {
	  	var question1 = Question({
	  		question: "Capital of Finland?",
	  		choices: {
	  			a: "Helsinki",
	  			b: "Tukholma",
	  			c: "Porvoo",
	  			d: "Sydney"
	  		},
	  		answer: 'a'
	  	});    	
      assert.equal("Capital of Finland?", question1.getQuestion());
    });
    it('should give choice when given letter', function () {
	  	var question1 = Question({
	  		question: "Capital of Finland?",
	  		choices: {
	  			a: "Helsinki",
	  			b: "Tukholma",
	  			c: "Porvoo",
	  			d: "Sydney"
	  		},
	  		answer: 'a'
	  	});    	
      assert.equal("Porvoo", question1.getChoice('c'));
      assert.equal("Helsinki", question1.getChoice('a'));
      assert.equal(undefined, question1.getChoice('e')); // Undefined if not present
  	});
    it('should give answer', function () {      
	  	var question1 = Question({
	  		question: "Capital of Finland?",
	  		choices: {
	  			a: "Helsinki",
	  			b: "Tukholma",
	  			c: "Porvoo",
	  			d: "Sydney"
	  		},
	  		answer: 'a'
	  	});    	
      assert.equal("Helsinki", question1.getAnswer('a'));
  	});
    it('should eval user given answer', function () {   
	     var question1 = Question({
	  		question: "Capital of Finland?",
	  		choices: {
	  			a: "Helsinki",
	  			b: "Tukholma",
	  			c: "Porvoo",
	  			d: "Sydney"
	  		},
	  		answer: 'a'
	  	});   
      assert.equal(true, question1.evalAnswer('a'));
      assert.equal(false, question1.evalAnswer('d'));
  	});
  });



  // SCORER
  describe('Scorer object', function () {	
    it('should score everything correctly', function () {
	  var scorer1 = Scorer(10); // 10 secs max. answer time    	
      assert.equal(5, scorer1.score(true, 4510));
	  assert.equal(8, scorer1.score(true, 2410));
	  assert.equal(0, scorer1.score(false, 7010));
	  assert.equal(0, scorer1.score(true, 13999));
	  var scorer2 = Scorer(); // Default answer time  
      assert.equal(14, scorer2.score(true, 810));
	  assert.equal(0, scorer2.score(false, 31410));
	  assert.equal(0, scorer2.score(true, 31410));

	});

  });

  // QuestionVault
  describe('QuestionVault object', function () {	
    it('creation of QuestionVault', function () {
    	var vault = QuestionVault([
			{
		  		question: "Question 1",
		  		choices: {
		  			a: "Helsinki",
		  			b: "Tukholma",
		  			c: "Porvoo",
		  			d: "Sydney"
		  		},
		  		answer: 'a'
	  		},
			{
		  		question: "Question 2",
		  		choices: {
		  			a: "Helsinki",
		  			b: "Tukholma",
		  			c: "Porvoo",
		  			d: "Sydney"
		  		},
		  		answer: 'b'
	  		},
			{
		  		question: "Question 3",
		  		choices: {
		  			a: "Helsinki",
		  			b: "Tukholma",
		  			c: "Porvoo",
		  			d: "Sydney"
		  		},
		  		answer: 'c'
	  		},	  			  		
    	]);

    	assert.equal(3, vault.getQuestionsLeft());
    	assert.equal('Question 1', vault.peekNextQuestion().getQuestion());  

	});
    it('get Questions one by one', function () {
    	var vault = QuestionVault([
			{
		  		question: "Question 1",
		  		choices: {
		  			a: "Helsinki",
		  			b: "Tukholma",
		  			c: "Porvoo",
		  			d: "Sydney"
		  		},
		  		answer: 'a'
	  		},
			{
		  		question: "Question 2",
		  		choices: {
		  			a: "Helsinki",
		  			b: "Tukholma",
		  			c: "Porvoo",
		  			d: "Sydney"
		  		},
		  		answer: 'b'
	  		},
			{
		  		question: "Question 3",
		  		choices: {
		  			a: "Helsinki",
		  			b: "Tukholma",
		  			c: "Porvoo",
		  			d: "Sydney"
		  		},
		  		answer: 'c'
	  		},	  			  		
    	]);	


    	assert.equal('a', vault.getNextQuestion().getAnswerChoice());  

    	assert.equal('Question 2', vault.getNextQuestion().getQuestion());
    	assert.equal(1, vault.getQuestionsLeft());
      	assert.equal('Question 3', vault.getNextQuestion().getQuestion());
    	assert.equal(null, vault.getNextQuestion());  

	});

  });

  // RoundResults
  describe('RoundResults object', function () {	
    it('save points and fetch them later', function () {
	  var rr1 = RoundResults();
	  rr1.addPoints(5, 7);
	  rr1.addPoints(6, 0);
	  assert.equal(7, rr1.getUserPoints(5));
	  assert.equal(0, rr1.getUserPoints(6));
	  assert.equal(undefined, rr1.getUserPoints(99));

	});

  });


  // Standings
  describe('Standings object', function () {	
    it('create standings object', function () {
	  var s1 = Standings();
	  rr1.addPoints(5, 7);
	  rr1.addPoints(6, 0);
	  assert.equal(7, rr1.getUserPoints(5));
	  assert.equal(0, rr1.getUserPoints(6));
	  assert.equal(undefined, rr1.getUserPoints(99));

	});

  });
});

