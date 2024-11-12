// Followed tutorial from https://www.mongodb.com/resources/languages/mern-stack-tutorial
// Some code from https://expressjs.com/en/starter/hello-world.html
// Referenced https://masteringjs.io/tutorials/express/post
// Referenced https://github.com/expressjs/cors?tab=readme-ov-file
// Referenced tutorial and documentation from https://socket.io/
// Used ChatGPT (asked about CORS, client-client and client-server communication, and more)

console.log('Starting backend application...');

//not used rn
require('dotenv').config();


const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { join } = require('node:path');
const { ClassicTrivia, Jeopardy, TriviaCrack } = require('./gamemodes');
const register = require('./routes/register.js');
const login = require('./routes/login.js');


const app = express();
const port = 3000;
const server = createServer(app);
const socketIO = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true
    }
});

// Log CORS configuration
console.log('CORS configuration:', { origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true });

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
    secret: 'trivia-game-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true in production with HTTPS
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    name: 'connect.sid'
}));

app.use("/register", register);
app.use("/login", login);

// Add a new route for logout
app.post("/api/logout", (req, res) => {
    if (req.session) {
        console.log('Session found, destroying...');
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                res.status(500).json({ success: false, message: "Failed to logout" });
            } else {
                res.clearCookie('connect.sid', {
                    path: '/',
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax'
                });
                console.log('Session destroyed successfully');
                res.json({ success: true, message: "Logged out successfully" });
            }
        });
    } else {
        console.log('No session found');
        res.json({ success: true, message: "Already logged out" });
    }
});

// Add a new route for fetching questions
app.get("/api/questions", (req, res) => {
    if (roomsList[roomCode].gameInstance.question_array &&roomsList[roomCode].gameInstance.question_array.length > 0) {
        res.json(roomsList[roomCode].gameInstance.question_array);
    } else {
        res.status(404).json({ error: "No questions available" });
    }
});

// Global object to track rooms and players
let roomsList = {};


const gameModes = [
    ClassicTrivia, // Index 0
    Jeopardy,      // Index 1
    TriviaCrack    // Index 2
    // NOTE: Other game modes (Jeopardy, Trivia Crack) are not yet implemented
    // Only Classic Trivia is currently available
];

// Function to start trivia game in a room
const startTriviaGame = async (roomCode, mode, duration, topic, usernames, totalQuestions) => {
    //unused
    let currentQuestionIndex = 0;

    // Validate room exists
    if (!roomsList[roomCode]) {
        console.error(`[${new Date().toISOString()}] Room ${roomCode} not found when starting game`);
        return;
    }

    console.log(`[${new Date().toISOString()}] Starting game in room ${roomCode}, Topic: ${topic}, Total Questions: ${totalQuestions}`);
    console.log(`[${new Date().toISOString()}] Players in game: ${usernames.join(',')}`);

    const GameClass = gameModes[mode];
    if (!GameClass) {
        console.error(`[${new Date().toISOString()}] Game mode at index ${mode} not found.`);
        return;
    }

    try {
        const gameInstance = new GameClass();
        await gameInstance.startGame(10, totalQuestions, usernames, topic, duration);
        await gameInstance.generateQuestion();
        const questions = await gameInstance.getQuestionArray();

        if (!questions || !Array.isArray(questions)) {
            throw new Error('Invalid questions array returned from game instance');
        }

        console.log(JSON.stringify(questions, null, 4)); // Log questions for debugging

        const transformedQuestions = questions.map(q => ({
            question: q.question,
            answers: Object.values(q.choices),
            answer: Object.keys(q.choices).indexOf(q.correctAnswer)
        }));

        const questionDuration = await gameInstance.time();

        // Store game state in room
        roomsList[roomCode].currentQuestion = transformedQuestions;
        roomsList[roomCode].duration = questionDuration;
        roomsList[roomCode].gameInstance = gameInstance;

        // Emit questions to room
        socketIO.to(roomCode).emit('question', {
            questions: transformedQuestions,
            duration: questionDuration
        });

        console.log(`[${new Date().toISOString()}] Successfully started game in room ${roomCode}`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error starting game in room ${roomCode}:`, error);
        socketIO.to(roomCode).emit('game error', { message: 'Failed to start game' });
    }
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
    console.log(`[${new Date().toISOString()}] A user connected: ${socket.id}`);
    console.log(`[${new Date().toISOString()}] Total connected clients: ${socketIO.engine.clientsCount}`);

    // Handle room creation
    socket.on('create room', (username, callback) => {
        // Add username to socket (Referenced ChatGPT about this)
        socket.username = username;

        const generateRoomCode = () => {
            const largestRoomNumber = 90000;
            const smallestRoomNumber = 10000;
            const roomCode = (Math.floor(Math.random() * (largestRoomNumber - smallestRoomNumber + 1)) + smallestRoomNumber).toString();
            return roomCode;
        }

        const roomCode = generateRoomCode();

        // Will keep generating a new room code if a room with that code already exists
        while (roomsList[roomCode] != null) {
            roomCode = generateRoomCode();
        }

        roomsList[roomCode] = {
            users: [],
            host: username,
            settings: {
                mode: null,
                duration: null,
                totalQuestions: null,
                topic: null
            }
        };

        // Automatically add the creator to the room and emit the updated player list
        roomsList[roomCode].users.push(username);
        socket.join(roomCode);
        socket.emit('update players', roomsList[roomCode].users);
        socket.emit('host status', true); // Notify creator they are the host
        console.log(`[${new Date().toISOString()}] Room created: ${roomCode}, Creator: ${username}`);
        console.log(`[${new Date().toISOString()}] Current rooms: ${Object.keys(roomsList)}`);
        callback({ success: true, roomCode });
    });

    // Handle joining a room
    socket.on('join room', (roomCode, username, callback) => {
        if (roomsList[roomCode]) {
            // Add username to socket (Referenced ChatGPT about this)
            socket.username = username;

            socket.join(roomCode);
            roomsList[roomCode].users.push(username);
            socketIO.to(roomCode).emit('update players', roomsList[roomCode].users);
            console.log(`[${new Date().toISOString()}] User ${username} joined room ${roomCode}`);
            console.log(`[${new Date().toISOString()}] Current users in room ${roomCode}: ${roomsList[roomCode].users}`);
            if (typeof callback === 'function') {
                callback({ success: true, message: `Joined room ${roomCode}` });
            }
        } else {
            console.log(`[${new Date().toISOString()}] Failed to join room: ${roomCode} (not found)`);
            if (typeof callback === 'function') {
                callback({ success: false, message: 'Room not found' });
            }
        }
    });

    // Handle starting the game
    socket.on('start game', (roomCode, topic, totalQuestions, duration, mode, callback) => {
        if (!roomsList[roomCode]) {
            callback({ success: false, message: 'Room not found' });
            return;
        }

        // Verify that the requesting user is the host
        if (socket.username !== roomsList[roomCode].host) {
            callback({ success: false, message: 'Only the host can start the game' });
            return;
        }

        if (roomsList[roomCode].users.length >= 2) {
            socketIO.to(roomCode).emit('start game');
            // Would do this instead of startTriviaGame directly
            // if (gamemode == "classic") {
            //     const triviaGamemode = new ClassicTrivia();
            //     startTriviaGame(roomCode, topic, roomsList[roomCode].users, totalQuestions);
            //     roomsList[roomCode] = { gamemode: triviaGamemode };
            // }
            // else if (gamemode == "trivia board") {
            //     // const triviaGamemode = new TriviaBoard();
            //     // startTriviaBoardGame(roomCode, topics, roomsList[roomCode].users);
            //     // roomsList[roomCode] = { gamemode: triviaGamemode };
            // }

            //testing
            console.log(mode);
            console.log(duration);

            startTriviaGame(roomCode, mode, duration, topic, roomsList[roomCode].users, totalQuestions);
            console.log(`[${new Date().toISOString()}] Game started in room ${roomCode}, Topic: ${topic}, Total Questions: ${totalQuestions}`);
            console.log(`[${new Date().toISOString()}] Players in game: ${roomsList[roomCode].users}`);
            callback({ success: true });
        } else {
            console.log(`[${new Date().toISOString()}] Failed to start game in room ${roomCode}: Not enough players`);
            console.log(`[${new Date().toISOString()}] Current players: ${roomsList[roomCode] ? roomsList[roomCode].users : 'Room not found'}`);
            callback({ success: false, message: 'Not enough players to start the game' });
        }
    });

    //socket.emit('submit answer', username, selectedAnswer, currentQuestionIndex);
    //Handle answer submission
    socket.on('submit answer', (roomCode, username, selectedAnswer, currentQuestionIndex) => {
        console.log(`[${new Date().toISOString()}] Received answer submission: Room ${roomCode}, User ${username}, Answer ${selectedAnswer}, Question ${currentQuestionIndex}`);

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
        
        roomsList[roomCode].gameInstance.checkAnswer(username, answer, currentQuestionIndex);

        //can emit to all connected clients using socketIO.emit, check to see if this is correct
        socketIO.to(roomCode).emit('update scores', roomsList[roomCode].gameInstance.scores);
        console.log(`[${new Date().toISOString()}] Answer submitted in room ${roomCode} by ${username}, Answer: ${answer}, Question Index: ${currentQuestionIndex}`);
        console.log(`[${new Date().toISOString()}] Updated scores: ${JSON.stringify(roomsList[roomCode].gameInstance.scores)}`);

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
        console.log(`[${new Date().toISOString()}] User disconnected: ${socket.username}`);
        console.log(`[${new Date().toISOString()}] Remaining connected clients: ${socketIO.engine.clientsCount}`);
        for (let roomCode in roomsList) {
            const room = roomsList[roomCode];
            // Referenced ChatGPT about socket.username
            if (room.users.includes(socket.username)) {
                room.users = room.users.filter(username => username !== socket.username);
                socketIO.to(roomCode).emit('update players', room.users);
                console.log(`[${new Date().toISOString()}] Updated players in room ${roomCode} after disconnect: ${room.users}`);
                if (room.users.length === 0) {
                    delete roomsList[roomCode];
                    console.log(`[${new Date().toISOString()}] Room ${roomCode} deleted (no users left)`);
                }
            }
        }
        console.log(`[${new Date().toISOString()}] Current rooms after disconnect: ${Object.keys(roomsList)}`);
    });

    // Handle game mode updates
    socket.on('update_game_mode', (roomCode, mode, callback) => {
        if (!roomsList[roomCode]) {
            callback({ success: false, message: 'Room not found' });
            return;
        }
        if (socket.username !== roomsList[roomCode].host) {
            callback({ success: false, message: 'Only the host can change game mode' });
            return;
        }
        roomsList[roomCode].settings.mode = mode;
        socketIO.to(roomCode).emit('game settings', { mode });
        callback({ success: true });
    });

    // Handle duration updates
    socket.on('update_duration', (roomCode, duration, callback) => {
        if (!roomsList[roomCode]) {
            callback({ success: false, message: 'Room not found' });
            return;
        }
        if (socket.username !== roomsList[roomCode].host) {
            callback({ success: false, message: 'Only the host can change question duration' });
            return;
        }
        roomsList[roomCode].settings.duration = duration;
        socketIO.to(roomCode).emit('game settings', { duration });
        callback({ success: true });
    });

    // Handle topic updates
    socket.on('update_topic', (roomCode, topic, callback) => {
        if (!roomsList[roomCode]) {
            callback({ success: false, message: 'Room not found' });
            return;
        }
        if (socket.username !== roomsList[roomCode].host) {
            callback({ success: false, message: 'Only the host can change topic' });
            return;
        }
        roomsList[roomCode].settings.topic = topic;
        socketIO.to(roomCode).emit('game settings', { topic });
        callback({ success: true });
    });

    // Handle total questions updates
    socket.on('update_total_questions', (roomCode, totalQuestions, callback) => {
        if (!roomsList[roomCode]) {
            callback({ success: false, message: 'Room not found' });
            return;
        }
        if (socket.username !== roomsList[roomCode].host) {
            callback({ success: false, message: 'Only the host can change total questions' });
            return;
        }
        roomsList[roomCode].settings.totalQuestions = totalQuestions;
        socketIO.to(roomCode).emit('game settings', { totalQuestions });
        callback({ success: true });
    });

    // Handle Jeopardy topic updates
    socket.on('update_jeopardy_topic', (roomCode, index, topic, callback) => {
        if (!roomsList[roomCode]) {
            callback({ success: false, message: 'Room not found' });
            return;
        }
        if (socket.username !== roomsList[roomCode].host) {
            callback({ success: false, message: 'Only the host can change Jeopardy topics' });
            return;
        }
        if (!roomsList[roomCode].settings.jeopardyTopics) {
            roomsList[roomCode].settings.jeopardyTopics = Array(6).fill('');
        }
        roomsList[roomCode].settings.jeopardyTopics[index] = topic;
        socketIO.to(roomCode).emit('game settings', {
            jeopardyTopics: roomsList[roomCode].settings.jeopardyTopics
        });
        callback({ success: true });
    });

    // Handle messages
    // Socket.io server receives messages then sends it to clients in the specific room
    socket.on('message', (message) => {
        const { roomCode, username, message: messageContent } = message;
        console.log(`[${new Date().toISOString()}] Received message in room ${roomCode}:`, JSON.stringify(message));
        socketIO.to(roomCode).emit('message', { username, message: messageContent });
        console.log(`[${new Date().toISOString()}] Broadcasted message to room ${roomCode}`);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
