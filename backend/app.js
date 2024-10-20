// Followed tutorial from https://www.mongodb.com/resources/languages/mern-stack-tutorial
// Some code from https://expressjs.com/en/starter/hello-world.html
// Referenced https://masteringjs.io/tutorials/express/post
// Referenced https://github.com/expressjs/cors?tab=readme-ov-file
// Referenced tutorial and documentation from https://socket.io/
// Used ChatGPT (asked about CORS, client-client and client-server communication, and more)

//not used rn
require('dotenv').config();


const express = require('express');
const cors = require('cors');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { join } = require('node:path');
const { ClassicTrivia } = require('./gamemodes');
const register = require('./routes/register.js');
const login = require('./routes/login.js');


const app = express();
const port = 3000;
const server = createServer(app);
const socketIO = new Server(server, { cors: { origin: '*' } });

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use("/register", register);
app.use("/login", login);

// Global object to track rooms and players
let roomsList = {};

const classicGame = new ClassicTrivia();


// Function to start trivia game in a room
const startTriviaGame = async (roomCode, topic, usernames, totalQuestions) => {
    let currentQuestionIndex = 0;
    
    classicGame.startGame(10, totalQuestions, usernames, topic);
    await classicGame.generateQuestion();
    const questions = await classicGame.getQuestionArray();

    const transformedQuestions = questions.map(q => ({
        question: q.question,
        answers: Object.values(q.choices),
        answer: Object.keys(q.choices).indexOf(q.correctAnswer)
      }));
      
      //testing
      //console.log(transformedQuestions);


    const sendQuestion = async () => {
        
        // console.log(transformedQuestions[0]); //testing
        roomsList[roomCode].currentQuestion = transformedQuestions; // Saving the questions
        socketIO.to(roomCode).emit('question', transformedQuestions);
    };
    
    sendQuestion();  // Send the all questions
}   
    /*
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
 */
// Handling connection and game events
socketIO.on('connection', (socket) => {
    console.log('A user connected');

    // Handle room creation
    socket.on('create room', (username , callback) => {
        const largestRoomNumber = 90000;
        const smallestRoomNumber = 10000;
        const roomCode = (Math.floor(Math.random() * (largestRoomNumber - smallestRoomNumber + 1)) + smallestRoomNumber).toString();
        roomsList[roomCode] = { users: [] };

        // Automatically add the creator to the room and emit the updated player list
        roomsList[roomCode].users.push(username);
        socket.join(roomCode);
        socket.emit('update players', roomsList[roomCode].users);
        callback({ success: true, roomCode });
    });

    // Handle joining a room
    socket.on('join room', ( roomCode, username , callback) => {
        if (roomsList[roomCode]) {
            socket.join(roomCode);
            roomsList[roomCode].users.push(username);
            socketIO.to(roomCode).emit('update players', roomsList[roomCode].users);
            callback({ success: true, message: `Joined room ${roomCode}` });
        } else {
            callback({ success: false, message: 'Room not found' });
        }
    });

    // Handle starting the game
    socket.on('start game', (roomCode, topic, usernames, totalQuestions, callback) => {
        if (roomsList[roomCode] && roomsList[roomCode].users.length >= 2) {
            socketIO.to(roomCode).emit('start game');
            startTriviaGame(roomCode, topic, usernames, totalQuestions);
            callback({ success: true });
        } else {
            callback({ success: false, message: 'Not enough players to start the game' });
        }
    });

    //socket.emit('submit answer', username, selectedAnswer, currentQuestionIndex);
    //Handle answer submission
    socket.on('submit answer', (username, selectedAnswer, currentQuestionIndex) => {
        
        let answer;
            if (selectedAnswer === 0) {
            answer = "a";
            } else if (selectedAnswer === 1) {
            answer = "b";
            } else if (selectedAnswer === 2) {
            answer = "c";
            } else if (selectedAnswer === 3) {
            answer = "d";
            }
            // testing
            // console.log(selectedAnswer);
            // console.log(answer);

        classicGame.checkAnswer(username, answer, currentQuestionIndex)
        
        
        
        // const currentQuestion = roomsList[roomCode].currentQuestion;
        // if (currentQuestion) {
        //     const isCorrect = currentQuestion.answer === answerIndex;
        //     const resultMessage = isCorrect ? 'correct' : 'wrong';
        //     socket.emit('answer result', { result: resultMessage });
        // } else {
        //     socket.emit('answer result', { result: 'no question' });
        // }
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

    // Handle messages
    // Socket.io server recieves messages then sends it to clients
    // Right now sends it to all clients, essentially a global chat
    socket.on('message', (message) => {
        socketIO.emit('message', message);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});