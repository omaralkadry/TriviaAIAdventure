const { Db } = require('mongodb');
const { ClassicTrivia } = require('../gamemodes');
const { TriviaBoard } = require('../gamemodes');
const { RandomTrivia } = require('../gamemodes');
require('dotenv').config();


describe('ClassicTrivia Game Mode', () => {
    let game;

    beforeEach(() => {
        game = new ClassicTrivia(4); // 2 players
        game.addPlayer('Player1');
        game.addPlayer('Player2');
        game.addPlayer('Player3');
        game.addPlayer('Player4');
        //game.setSettings(5, 30, 10); // 5 questions, 30 seconds per question. this is now done in start game
        game.startGame(10, 2, game.players, 'Science', 30);
    });

    test('should initialize with correct settings', () => {
        expect(game.players.length).toBe(4);
        expect(game.totalQuestions).toBe(2);
        expect(game.timePerQuestion).toBe(30);
        expect(game.pointsperquestion).toBe(10);
    });

    test('should correctly set topic for trivia game', () => {
        //game.setTopic('Science'); done in beforeEach now
        expect(game.topic).toBe('Science');
    });

    test('should generate a trivia question using OpenAI', async () => {
        game.setTopic('Science');
        await game.generateQuestion();
        const questions = await game.getQuestionArray();

        //testing 
        //console.log('Test Generated Question:', questions);

        expect(Array.isArray(questions)).toBe(true);
        expect(questions.length).toBeGreaterThan(0);
        
        questions.forEach((question, index) => {
            expect(question).toHaveProperty('question');
            expect(question).toHaveProperty('choices');
            expect(question).toHaveProperty('correctAnswer');

            //testing
            //console.log(`Question ${index}: `, question.question);
            //console.log('Choices: ', question.choices);
            //console.log('Answer: ', question.correctAnswer);
        });
    }, 30000);

    test('should simulate a running game and then run endgame() function', async () => {
        
        await game.generateQuestion();
        
        answers = {"Player1": "a", "Player2": "b", "Player3": "c","Player4": "d", }
        
        expect(game.currentQuestion).toBe(0);
        game.players.forEach(player => {
            game.scores[player] = 0;
            game.checkAnswer(player, answers[player]);
        });
        await game.incrementQuestion();
        expect(game.currentQuestion).toBe(1);

        await game.endGame();

        //testing
        //console.log("question1: ", game.question_array[0])
        //console.log('Final Scores:', game.scores);
        //console.log('Final Ranks:', game.ranks);


    }, 60000);

});

describe('ClassicTrivia Question Retrieval', () => {
    let game;

    beforeEach(async () => {
        game = new ClassicTrivia(2); // 2 players
        game.addPlayer('Player1');
        game.addPlayer('Player2');
        game.setSettings(5, 30, 10); // 5 questions, 30 seconds per question
        game.setTopic('Science');
        await game.generateQuestion(); // Generate questions before running the tests
    });

    test('should get the current question', async () => {
        const question = await game.getQuestionArray();
        const currentQuestionText = await game.getQuestion();

        expect(currentQuestionText).toBe(question[game.currentQuestion].question);
    });

    test('should get the choices for the current question', async () => {
        const choices = await game.getChoices();
        const question = await game.getQuestionArray(); 

        expect(choices).toEqual(question[game.currentQuestion].choices);
    });

    test('should get the correct answer for the current question', async () => {
        const correctAnswer = await game.getAnswer();
        const question = await game.getQuestionArray();
        expect(correctAnswer).toBe(question[game.currentQuestion].correctAnswer);
    });

    test('should increment the current question index', async () => {
        const initialIndex = game.currentQuestion;
        await game.incrementQuestion();

        expect(game.currentQuestion).toBe(initialIndex + 1);
    }, 60000);
});



describe('TriviaBoard Game Mode', () => {
    let game;

    beforeEach(async () => {
        game = new TriviaBoard(2);
        const defaultTopics = ["History", "Science", "Art", "Literature", "Geography", "Sports"];
        await game.startGame(10, 30, ['Player1', 'Player2'], defaultTopics, 30);
        await game.generateQuestion();
    }, 1000000);

    test('should initialize with correct settings', () => {
        expect(game.topics).toHaveLength(6);
        expect(game.topics).toEqual(["History", "Science", "Art", "Literature", "Geography", "Sports"]);
        expect(game.question_array).toHaveLength(30);
        expect(game.answered_array).toHaveLength(30);
        expect(game.totalQuestions).toBe(30);
        expect(game.timePerQuestion).toBe(30);
        expect(game.players.length).toBe(2);
    });
    /*
    test('should set topics correctly, filling with defaults', () => {
        const defaultTopics = ["History", "Science", "Art", "Literature", "Geography", "Sports"];
        game.setTopics(defaultTopics);
        expect(game.topics).toEqual(["History", "Science", "Art", "Literature", "Geography", "Sports"]); // 4 default topics filled
    });
    */

    test('should generate questions for each topic', async () => {
        const questions = await game.getQuestionArray();

        expect(Array.isArray(questions)).toBe(true);
        expect(questions.length).toBe(30); // 6 topics * 5 questions each
    }, 6000); 

    test('should check answers and update scores correctly', async () => {
        const question = game.question_array[0];
        const correctAnswer = question.correctAnswer; 

        game.scores = { 'Player1': 0, 'Player2': 0 };
        game.checkAnswer('Player1', correctAnswer, 0);

        expect(game.scores['Player1']).toBeGreaterThan(0);
    }, 6000);

    test('should generate scores based on question index', async () => {
        const questionIndex = 3; 
        game.scores = { 'Player1': 0 };
        game.checkAnswer('Player1', game.question_array[questionIndex].correctAnswer, questionIndex);

        const expectedPoints = (questionIndex % 5 + 1) * 200; // Should be 800 for questionIndex 3
        expect(game.scores['Player1']).toBe(expectedPoints);
    }, 6000);
});

describe.only('RandomTrivia Game Mode', () => {
    let game;
  
    beforeEach(() => {
      game = new RandomTrivia(2);
    });
  
    test('should initialize with correct settings', () => {
      game.startGame(10, 3, ['Player1', 'Player2', 'Player3'], [], 30);
      expect(game.players.length).toBe(3);
      expect(game.totalQuestions).toBe(3);
      expect(game.timePerQuestion).toBe(30);
      expect(game.pointsperquestion).toBe(10);
      expect(game.topics.length).toBe(3);
    });
  
    test('should set unique topics for each question', () => {
      game.startGame(10, 3, ['Player1', 'Player2', 'Player3'], [], 30);
      const uniqueTopics = new Set(game.topics);
      expect(uniqueTopics.size).toBe(3);
    });
  
    test('should generate questions for all topics', async () => {
      game.startGame(10, 3, ['Player1', 'Player2', 'Player3'], [], 30);
      await game.generateQuestion();
      const questions = await game.getQuestionArray();
      expect(questions.length).toBe(3);
      questions.forEach((question, index) => {
        expect(question.topic).toBe(game.topics[index]);
        expect(question).toHaveProperty('question');
        expect(question).toHaveProperty('topic');
      });
    }, 30000);
  
    test('should correctly check multiple answers', async () => {
        game.startGame(10, 3, ['Player1', 'Player2', 'Player3'], [], 30);
        await game.generateQuestion();
        const playerAnswers = {
          'Player1': 'Correct answer',
          'Player2': 'Partially correct answer',
          'Player3': 'Incorrect answer'
        };
        const results = await game.checkAnswer(playerAnswers, 0);
        console.log(results)
        expect(results).toHaveProperty('Player1');
        expect(results).toHaveProperty('Player2');
        expect(results).toHaveProperty('Player3');
        expect(typeof results.Player1).toBe('boolean');
        console.log(game.scores);
        expect(game.scores['Player1']).toBe(10);
        //expect(game.scores['Player2']).toBe(10);
        expect(game.scores['Player3']).toBe(0);
      }, 30000);
  
    test('should increment questions and get current topic', async () => {
      game.startGame(10, 3, ['Player1', 'Player2', 'Player3'], [], 30);
      await game.generateQuestion();
      expect(game.currentQuestion).toBe(0);
      expect(game.getCurrentTopic()).toBe(game.topics[0]);
      await game.incrementQuestion();
      expect(game.currentQuestion).toBe(1);
      expect(game.getCurrentTopic()).toBe(game.topics[1]);
    });
});