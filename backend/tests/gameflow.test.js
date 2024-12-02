const { ClassicTrivia } = require('../gamemodes');
const { Server } = require('socket.io');
const { createServer } = require('http');
const Client = require('socket.io-client');
require('dotenv').config();

// Mock OpenAI
jest.mock('openai', () => require('./mockOpenAI'));

describe('Game Flow Tests', () => {
    let io, serverSocket, clientSocket, httpServer;
    let game;

    beforeAll((done) => {
        httpServer = createServer();
        io = new Server(httpServer);
        httpServer.listen(() => {
            const port = httpServer.address().port;
            clientSocket = new Client(`http://localhost:${port}`);
            io.on('connection', (socket) => {
                serverSocket = socket;
            });
            clientSocket.on('connect', done);
        });
    });

    afterAll(() => {
        io.close();
        clientSocket.close();
        httpServer.close();
    });

    beforeEach(() => {
        game = new ClassicTrivia(2);
    });

    test('should create and start a game successfully', async () => {
        const players = ['Player1', 'Player2'];
        game.startGame(10, 1, players, 'Science', 30);
        expect(game.players.length).toBe(2);
        expect(game.topic).toBe('Science');
        expect(game.totalQuestions).toBe(1);
        expect(game.timePerQuestion).toBe(30);
        expect(game.pointsperquestion).toBe(10);
    });

    test('should generate and process questions', async () => {
        const players = ['Player1', 'Player2'];
        game.startGame(10, 1, players, 'Science', 30);
        await game.generateQuestion();

        const questionArray = await game.getQuestionArray();
        expect(questionArray).toHaveLength(1);

        const question = questionArray[0].question;
        const choices = questionArray[0].choices;
        const correctAnswer = questionArray[0].correctAnswer;

        expect(question).toBe('What is the capital of France?');
        expect(choices).toHaveProperty('a', 'London');
        expect(choices).toHaveProperty('b', 'Berlin');
        expect(choices).toHaveProperty('c', 'Paris');
        expect(choices).toHaveProperty('d', 'Madrid');
        expect(correctAnswer).toBe('c');
    });

    test('should handle player answers and scoring correctly', async () => {
        const players = ['Player1', 'Player2'];
        game.startGame(10, 1, players, 'Science', 30);
        await game.generateQuestion();

        // Player1 answers correctly (Paris - option c)
        game.checkAnswer('Player1', 'c', 0);
        // Player2 answers incorrectly (London - option a)
        game.checkAnswer('Player2', 'a', 0);

        expect(game.scores['Player1']).toBe(10); // Correct answer gets points
        expect(game.scores['Player2']).toBe(0);  // Wrong answer gets no points
    });

    test('should handle Socket.IO game events', (done) => {
        let eventCount = 0;
        const expectedEvents = 2;

        clientSocket.on('game update', (data) => {
            expect(data).toBeDefined();
            eventCount++;

            if (eventCount === expectedEvents) {
                done();
            }
        });

        // Emit game events
        serverSocket.emit('game update', {
            type: 'question',
            content: 'What is the capital of France?'
        });

        serverSocket.emit('game update', {
            type: 'score',
            player: 'Player1',
            score: 10
        });
    });
});
