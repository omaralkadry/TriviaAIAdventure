// Load environment variables from the .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { join } = require('node:path');

const app = express();
const port = 3000;
const server = createServer(app);
const socketIO = new Server(server, { cors: { origin: '*' } });

app.use(cors({ origin: '*' }));
app.use(express.json());

// Global object to track rooms and players
let roomsList = {};

// Function to generate a static trivia question with more questions added
const generateTriviaQuestion = () => {
    const questions = [
        { question: "What is the capital of France?", answers: ["Paris", "Berlin", "Madrid", "Rome"], answer: 0 },
        { question: "What is 2 + 2?", answers: ["3", "4", "5", "6"], answer: 1 },
        { question: "Who wrote 'Hamlet'?", answers: ["Shakespeare", "Dante", "Homer", "Virgil"], answer: 0 },
        { question: "What is the capital of Japan?", answers: ["Tokyo", "Kyoto", "Osaka", "Nagoya"], answer: 0 },
        { question: "What is the largest planet in our solar system?", answers: ["Mars", "Earth", "Jupiter", "Saturn"], answer: 2 },
        { question: "Who painted the Mona Lisa?", answers: ["Leonardo da Vinci", "Vincent van Gogh", "Michelangelo", "Pablo Picasso"], answer: 0 },
        { question: "What is the fastest land animal?", answers: ["Cheetah", "Lion", "Horse", "Elephant"], answer: 0 },
        { question: "Which element has the chemical symbol 'O'?", answers: ["Oxygen", "Osmium", "Gold", "Oganesson"], answer: 0 },
        { question: "In which year did the Titanic sink?", answers: ["1910", "1912", "1915", "1920"], answer: 1 },
        { question: "Which country won the FIFA World Cup in 2018?", answers: ["Germany", "Brazil", "France", "Argentina"], answer: 2 },
        { question: "What is the hardest natural substance on Earth?", answers: ["Gold", "Iron", "Diamond", "Steel"], answer: 2 },
        { question: "Which ocean is the largest?", answers: ["Atlantic", "Indian", "Pacific", "Arctic"], answer: 2 },
        { question: "Which language has the most native speakers?", answers: ["English", "Spanish", "Chinese", "Hindi"], answer: 2 },
        { question: "Who discovered penicillin?", answers: ["Alexander Fleming", "Marie Curie", "Isaac Newton", "Louis Pasteur"], answer: 0 },
        { question: "What is the smallest country in the world?", answers: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], answer: 1 }
    ];

    return questions[Math.floor(Math.random() * questions.length)];
};

// Function to start trivia game in a room
const startTriviaGame = async (roomCode) => {
    let currentQuestionIndex = 0;

    const sendQuestion = () => {
        const question = generateTriviaQuestion();
        roomsList[roomCode].currentQuestion = question; // Saving current question
        socketIO.to(roomCode).emit('question', question);
    };

    sendQuestion();  // Send the first question

    // Send each question after 30 seconds, reset the timer and send new question
    const questionInterval = setInterval(() => {
        if (currentQuestionIndex < 5) {  // Set a limit of 5 questions
            sendQuestion();
            currentQuestionIndex++;
        } else {
            clearInterval(questionInterval);  // End game after all questions are sent
            socketIO.to(roomCode).emit('game over', { message: "The game has ended!" });
        }
    }, 1000);  // 10 seconds between questions
};

// Handling connection and game events
socketIO.on('connection', (socket) => {
    console.log('A user connected');

    // Handle room creation
    socket.on('create room', (callback) => {
        const largestRoomNumber = 90000;
        const smallestRoomNumber = 10000;
        const roomCode = Math.floor(Math.random() * (largestRoomNumber - smallestRoomNumber + 1)) + smallestRoomNumber;
        roomsList[roomCode] = { users: [] };

        // Automatically add the creator to the room and emit the updated player list
        roomsList[roomCode].users.push(socket.id);
        socket.join(roomCode);
        socket.emit('update players', roomsList[roomCode].users);
        callback({ success: true, roomCode });
    });

    // Handle joining a room
    socket.on('join room', (roomCode, callback) => {
        if (roomsList[roomCode]) {
            socket.join(roomCode);
            roomsList[roomCode].users.push(socket.id);
            socketIO.to(roomCode).emit('update players', roomsList[roomCode].users);
            callback({ success: true, message: `Joined room ${roomCode}` });
        } else {
            callback({ success: false, message: 'Room not found' });
        }
    });

    // Handle starting the game
    socket.on('start game', (roomCode, callback) => {
        if (roomsList[roomCode] && roomsList[roomCode].users.length >= 2) {
            socketIO.to(roomCode).emit('start game');
            startTriviaGame(roomCode);
            callback({ success: true });
        } else {
            callback({ success: false, message: 'Not enough players to start the game' });
        }
    });

    // Handle answer submission
    socket.on('submit answer', (roomCode, answerIndex) => {
        const currentQuestion = roomsList[roomCode].currentQuestion;
        if (currentQuestion) {
            const isCorrect = currentQuestion.answer === answerIndex;
            const resultMessage = isCorrect ? 'correct' : 'wrong';
            socket.emit('answer result', { result: resultMessage });
        } else {
            socket.emit('answer result', { result: 'no question' });
        }
    });

    // Handle disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
        for (let roomCode in roomsList) {
            const room = roomsList[roomCode];
            if (room.users.includes(socket.id)) {
                room.users = room.users.filter(id => id !== socket.id);
                socketIO.to(roomCode).emit('update players', room.users);
                if (room.users.length === 0) {
                    delete roomsList[roomCode];
                }
            }
        }
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});