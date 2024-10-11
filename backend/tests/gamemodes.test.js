const { ClassicTrivia } = require('../gamemodes');
require('dotenv').config();


describe('ClassicTrivia Game Mode', () => {
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
        const questions = await game.generateQuestion();

        //testing 
        //console.log('Test Generated Question:', questions);

        expect(Array.isArray(questions)).toBe(true);
        expect(questions.length).toBeGreaterThan(0);
        
        questions.forEach((question, index) => {
            expect(question).toHaveProperty('question');
            expect(question).toHaveProperty('choices');
            expect(question).toHaveProperty('correctAnswer');

            //testing
            console.log(`Question ${index}: `, question.question);
            console.log('Choices: ', question.choices);
            console.log('Answer: ', question.correctAnswer);
        });
    }, 30000);
});