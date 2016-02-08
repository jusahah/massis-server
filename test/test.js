var assert = require('assert');

// Deps from app
var controller = require('../domain/controller');
var Question   = require('../domain/dynamicComponents/Question');
var QuestionVault = require('../domain/dynamicComponents/QuestionVault');
var Scorer     = require('../domain/dynamicComponents/Scorer');
var RoundResults = require('../domain/dynamicComponents/RoundResults');
var Standings    = require('../domain/dynamicComponents/Standings');
var mergerFun    = require('../domain/dynamicComponents/StandingsMerger');
var Tournament   = require('../domain/dynamicComponents/Tournament');

describe('Dynamic components tests', function() {

  describe('Tournament table', function () {	
    it('create tournament', function () {	
    	var tournamentData = {
    		startsAt: Date.now() + 1000 * 180,
    		maxPlayers: 200,
    		questions: [
	    		{
			  		question: "Capital of Finland?", // Question missing
			  		choices: {
			  			a: "Helsinki",
			  			b: "Tukholma",
			  			c: "Porvoo",
			  			d: "Sydney"
			  		},
			  		answer: 'a'
			  	},
	    		{
			  		question: "Capital of Sweden?", // Question missing
			  		choices: {
			  			a: "Helsinki",
			  			b: "Tukholma",
			  			c: "Porvoo",
			  			d: "Sydney"
			  		},
			  		answer: 'b'
			  	},
	    		{
			  		question: "Capital of Nigeria?", // Question missing
			  		choices: {
			  			a: "Helsinki",
			  			b: "Tukholma",
			  			c: "Abuja",
			  			d: "Sydney"
			  		},
			  		answer: 'c'
			  	},
	    		{
			  		question: "Capital of Uganda?", // Question missing
			  		choices: {
			  			a: "Helsinki",
			  			b: "Tukholma",
			  			c: "Porvoo",
			  			d: "Kampala"
			  		},
			  		answer: 'd'
			  	}			  				  				  	

    		]
    	}

    	var t = Tournament(tournamentData);
    	console.log("TOURNAMENT OBj------------------")
    	console.log(t);

    	assert.equal(4, t.getQuestionsNumber());
    });
  });

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
    it('create standings object and getCurrentRanking()', function () {
	  var s1 = Standings([4,5,2,1,8,7]);
	  assert.equal(6, s1.getUsersAmount());
	  assert.equal(1, s1.getCurrentRanking(4));
	  assert.equal(6, s1.getCurrentRanking(7));
	  assert.equal(undefined, s1.getCurrentRanking(999));
	});
    it('get Nth()', function () {
	  var s1 = Standings([4,5,2,1,8,7]);
	  assert.deepEqual({uid: 1, points: 0}, s1.getNth(4));
	  assert.deepEqual({uid: 8, points: 0}, s1.getNth(5));
	  assert.equal(undefined, s1.getNth(-999));
	});
    it('get userIDToRanking', function () {
	  var s1 = Standings([4,5,2]);
	  assert.deepEqual({
	  	4: "1_0",
	  	5: "2_0",
	  	2: "3_0"
	  }, s1.getUserIDToRanking());
	});	
    it('get Rankings', function () {
	  var s1 = Standings([4,2]);
	  assert.deepEqual([{uid: 4, points: 0}, {uid: 2, points: 0}], s1.getRankings());
	});		
  });


  // Merger
  describe('Merger function 1 (<= 10 players)', function () {	
    it('create standings object and getCurrentRanking()', function () {
	  var s1 = Standings([400,500,200,100]);
	  var r1 = RoundResults();
	  r1.addPoints(999, 10); // Adding to player who is not participating
	  r1.addPoints(400, 10);
	  r1.addPoints(200, 3);
	  r1.addPoints(100, 1);
	  var infoO = mergerFun(s1, r1); // New standings and standing views
	  console.log(infoO);
	  var s2 = infoO.standings;
	  var sw = infoO.standingsViews;
	  assert.deepEqual({uid: 400, points: 10}, s2.getNth(1));
	  assert.deepEqual({uid: 200, points: 3}, s2.getNth(2));
	  assert.equal(2, s2.getCurrentRanking(200));
	  assert.equal(1, s2.getCurrentRanking(400));
	  assert.equal(3, s2.getCurrentRanking(100));
	  assert.equal(4, s2.getCurrentRanking(500));

	  // Test views
	  // All views should be same for this few players
	  var view400 = sw[400];
	  assert.deepEqual({
	  	1: {uid: 400, points: 10},
	  	2: {uid: 200, points: 3},
	  	3: {uid: 100, points: 1},
	  	4: {uid: 500, points: 0}
	  }, view400);
	  var view500 = sw[500];
	  assert.deepEqual({
	  	1: {uid: 400, points: 10},
	  	2: {uid: 200, points: 3},
	  	3: {uid: 100, points: 1},
	  	4: {uid: 500, points: 0}
	  }, view500);
	  var view100 = sw[100];
	  assert.deepEqual({
	  	1: {uid: 400, points: 10},
	  	2: {uid: 200, points: 3},
	  	3: {uid: 100, points: 1},
	  	4: {uid: 500, points: 0}
	  }, view100);	  

	});
		
  });
  // Merger 2
  describe('Merger function 2 (> 10 players)', function () {	
    it('create standings object and getCurrentRanking()', function () {
	  var s1 = Standings([100,200,300,400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300]); // 13 players
	  var r1 = RoundResults();
	  r1.addPoints(999, 10); // Adding to player who is not participating
	  r1.addPoints(100, 10);
	  r1.addPoints(200, 3);
	  r1.addPoints(300, 1);
	  r1.addPoints(400, 15);
	  r1.addPoints(500, 9);
	  r1.addPoints(600, 19);
	  r1.addPoints(700, 0);
	  r1.addPoints(800, 2);
	  r1.addPoints(900, 11);
	  r1.addPoints(1300, 12);
	  r1.addPoints(1200, 27);
	  r1.addPoints(1100, 6);
	  r1.addPoints(1000, 4);

	  // Order should be: 1200, 600, 400, 1300, 900, 100, 500, 1100, 1000, 200, 800, 300, 700

	  var infoO = mergerFun(s1, r1); // New standings and standing views
	  console.log(infoO);
	  var s2 = infoO.standings;
	  var sw = infoO.standingsViews;
	  assert.deepEqual({uid: 1200, points: 27}, s2.getNth(1));
	  assert.deepEqual({uid: 900, points: 11}, s2.getNth(5));
	  assert.deepEqual({uid: 700, points: 0}, s2.getNth(13));

	  assert.equal(10, s2.getCurrentRanking(200));
	  assert.equal(3, s2.getCurrentRanking(400));



	  // Test views
	  // All views should not be same anymore
	  var view400 = sw[400];
	  var topFive400 = view400.top5;
	  var neighbours400 = view400.neighbours;
	  console.log("400 neighs");
	  console.log(neighbours400);
	  console.log("-----------");

	  assert.deepEqual({
	  	1: {uid: 1200, points: 27},
	  	2: {uid: 600, points: 19},
	  	3: {uid: 400, points: 15},
	  	4: {uid: 1300, points: 12},
	  	5: {uid: 900, points: 11}
	  }, topFive400);

	  assert.deepEqual({
	  	0: {uid: 1200, points: 27},
	  	1: {uid: 600, points: 19},
	  	2: {uid: 400, points: 15},
	  	3: {uid: 1300, points: 12},
	  	4: {uid: 900, points: 11}
	  }, neighbours400);


	  var view500 = sw[500];
	  var topFive500 = view500.top5;
	  var neighbours500 = view500.neighbours;

	  console.log("500 neighs");
	  console.log(neighbours500);
	  console.log("-----------");

	  assert.deepEqual(topFive400, topFive500); // All players should have same topFive
	  assert.deepEqual({
	  	0: {uid: 900, points: 11},
	  	1: {uid: 100, points: 10},
	  	2: {uid: 500, points: 9},
	  	3: {uid: 1100, points: 6},
	  	4: {uid: 1000, points: 4}	  	

	  },neighbours500);



	  // Add some points again
	  r2 = RoundResults();
	  r2.addPoints(999, 10); // Adding to player who is not participating
	  r2.addPoints(100, 0); // 100 gets nothing
	  r2.addPoints(200, 13);
	  r2.addPoints(300, 5);
	  r2.addPoints(400, 21);
	  r2.addPoints(500, 3);
	  r2.addPoints(600, 67);
	  r2.addPoints(700, 89);
	  r2.addPoints(800, 28);
	  r2.addPoints(900, 3);
	  r2.addPoints(1300, 65);
	  r2.addPoints(1200, 26);
	  r2.addPoints(1100, 1);
	  r2.addPoints(1000, 101);


	  // Order now (with points):
	  /*
        1)  1000: 105
        2)  700:  89
        3)  600:  86
        4)  1300: 77
        5)  1200: 53
        6)  400:  36
        7)  800:  30
        8)  200:  16
        9)  900:  14
        10) 500:  12	  
	  	11) 100:  10
	  	12) 1100: 7
	  	13) 300:  6
	*/

	  var infoO2 = mergerFun(s2, r2); // New standings and standing views
	  console.log(infoO2);
	  var s3 = infoO2.standings;
	  var sw3 = infoO2.standingsViews;

	  assert.deepEqual({uid: 1000, points: 105}, s3.getNth(1));
	  assert.deepEqual({uid: 1200, points: 53}, s3.getNth(5));
	  assert.deepEqual({uid: 300, points: 6}, s3.getNth(13));

	  assert.equal(11, s3.getCurrentRanking(100));
	  assert.equal(2, s3.getCurrentRanking(700));	  	  

	  // Test views
	  // All views should not be same anymore
	  var view300 = sw3[300];
	  var topFive300 = view300.top5;
	  var neighbours300 = view300.neighbours;
	  console.log("300 neighs");
	  console.log(neighbours300);
	  console.log("-----------");

	  assert.deepEqual({
	  	1: {uid: 1000, points: 105},
	  	2: {uid: 700, points: 89},
	  	3: {uid: 600, points: 86},
	  	4: {uid: 1300, points: 77},
	  	5: {uid: 1200, points: 53}
	  }, topFive300);

	  // Only has neighbours on top
	  assert.deepEqual({
	  	0: {uid: 100, points: 10},
	  	1: {uid: 1100, points: 7},
	  	2: {uid: 300, points: 6}
	  }, neighbours300);


	  var view900 = sw3[900];
	  var topFive900 = view900.top5;
	  var neighbours900 = view900.neighbours;

	  console.log("900 neighs");
	  console.log(neighbours900);
	  console.log("-----------");

	  assert.deepEqual(topFive300, topFive900); // All players should have same topFive
	  assert.deepEqual({
	  	0: {uid: 800, points: 30},
	  	1: {uid: 200, points: 16},
	  	2: {uid: 900, points: 14},
	  	3: {uid: 500, points: 12},
	  	4: {uid: 100, points: 10}	  	
	  },neighbours900);
        
        

         
     


	});
		
  });
});

