const { ClassicTrivia } = require('../gamemodes');
require('dotenv').config();


describe.only('ClassicTrivia Game Mode', () => {
    let game;

    beforeEach(() => {
        game = new ClassicTrivia(2); // 2 players
        game.addPlayer('Player1');
        game.addPlayer('Player2');
        game.setSettings(5, 30); // 5 questions, 30 seconds per question
    });

    test('should initialize with correct settings', () => {
        expect(game.players.length).toBe(2);
        expect(game.totalQuestions).toBe(5);
        expect(game.timePerQuestion).toBe(30);
    });

    test('should correctly set topic for trivia game', () => {
        game.setTopic('Science');
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
});

describe('ClassicTrivia Question Retrieval', () => {
    let game;

    beforeEach(async () => {
        game = new ClassicTrivia(2); // 2 players
        game.addPlayer('Player1');
        game.addPlayer('Player2');
        game.setSettings(5, 30); // 5 questions, 30 seconds per question
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