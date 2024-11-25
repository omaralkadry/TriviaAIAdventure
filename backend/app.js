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
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { join } = require('node:path');
const { ClassicTrivia, TriviaBoard, RandomTrivia } = require('./gamemodes');
const register = require('./routes/register.js');
const login = require('./routes/login.js');
const history = require('./routes/history.js');


const app = express();
const port = 3000;
const server = createServer(app);
const socketIO = new Server(server, { cors: { origin: '*' } });

// Log CORS configuration
console.log('CORS configuration:', { origin: '*' });

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use("/register", register);
app.use("/login", login);
app.use("/history", history);

// Add a new route for logout
app.post("/logout", (req, res) => {
    // Here you would typically destroy the session
    // For now, we'll just send a success response
    res.json({ success: true, message: "Logged out successfully" });
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
    TriviaBoard,   // Index 1
    RandomTrivia //thirdmode here
];

// Function to start trivia game in a room
const startTriviaGame = async (roomCode, mode, duration, topic_array, usernames, totalQuestions) => {
    //unused
    let currentQuestionIndex = 0;
    
    const GameClass = gameModes[mode];
    if (!GameClass) {
        console.error(`Game mode at index ${mode} not found.`);
        return;
    }
    const gameInstance = new GameClass();

    gameInstance.startGame(10, totalQuestions, usernames, topic_array, duration);
    const error = await gameInstance.generateQuestion();

    if (error === "content_filter") {
        return "content_filter";
    }

    const questions = await gameInstance.getQuestionArray();
    let transformedQuestions;
    if (mode === 2) { // RandomTrivia
        transformedQuestions = questions.map(q => ({
            question: q.question,
            topic: q.topic
        }));
    } else {
        transformedQuestions = questions.map(q => ({
            question: q.question,
            answers: Object.values(q.choices),
            answer: Object.keys(q.choices).indexOf(q.correctAnswer)
        }));
    }
    

      //testing
      //console.log(transformedQuestions);
    
    const questionDuration = await gameInstance.time();
    //console.log(questionDuration);
    const sendQuestion = async () => {

        // console.log(transformedQuestions[0]); //testing
        roomsList[roomCode].currentQuestion = transformedQuestions; // Saving the questions
        roomsList[roomCode].duration = questionDuration;
        roomsList[roomCode].gameInstance = gameInstance; 
        socketIO.to(roomCode).emit('question', { questions: transformedQuestions, duration: questionDuration });
    };

    // Send game settings to all users inside room
    // So socket.io-clients know which mode to play
    socketIO.to(roomCode).emit('game settings', { jeopardyTopics: gameInstance.topics });

    sendQuestion();  // Send the all questions

    // If gamemode is Trivia Board, then randomly pick who will go first
    if (mode === 1) {
        // Referenced https://www.geeksforgeeks.org/how-to-generate-random-number-in-given-range-using-javascript/
        const largestIndex = roomsList[roomCode].users.length;
        const index = Math.floor(Math.random() * largestIndex);

        const username = roomsList[roomCode].users[index];
        socketIO.to(roomCode).emit('next question selector', username);
    }

    socketIO.to(roomCode).emit('update scores', gameInstance.scores);
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
            // Referenced https://www.geeksforgeeks.org/how-to-generate-random-number-in-given-range-using-javascript/
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
        socket.roomCode = roomCode;
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
            // Check if user is already in room
            if (roomsList[roomCode].users.includes(username)) {
                callback({ success: false, message: 'User already in room' });
                return;
            }

            // Add username to socket (Referenced ChatGPT about this)
            socket.username = username;
            socket.roomCode = roomCode;
            socket.join(roomCode);
            roomsList[roomCode].users.push(username);
            socketIO.to(roomCode).emit('update players', roomsList[roomCode].users);
            socket.emit('host status', false);

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

    const errorCheck = (roomCode, username, message, callback) => {
        if (!roomsList[roomCode]) {
            callback({ success: false, message: 'Room not found' });
            return true;
        }

        // Verify that the requesting user is the host
        if (username !== roomsList[roomCode].host) {
            callback({ success: false, message: `Only the host can ${message}` });
            return true;
        }

        // No error
        return false;
    };
    
    // Handle starting the game
    socket.on('start game', (roomCode, topic_array, totalQuestions = null, duration, mode, callback) => {
        // Call errorCheck function
        if (errorCheck(roomCode, socket.username, 'start game', callback)) {
            return;
        }

        if (roomsList[roomCode].users.length >= 2) {
            socketIO.to(roomCode).emit('start game');

            //testing
            console.log('Game mode: ' + mode);
            console.log('Duration: ' + duration);

            if (mode === 1) { // TriviaBoard
                totalQuestions = 30;
            }
            const error = startTriviaGame(roomCode, mode, duration, topic_array, roomsList[roomCode].users, totalQuestions);

            // Check if GPT doesn't want to generate questions because of an innapropriate topic
            if (error === "content_filter") {
                console.log(`[${new Date().toISOString()}] Failed to start game in room ${roomCode}: GPT may not like the topic`);
                callback({ success: false, message: 'Please enter a different topic' });
                return;
            }

            //TODO removed topic in console log. needs adjustment. old code after: roomCode}, Topic: ${topic},
            console.log(`[${new Date().toISOString()}] Game started in room ${roomCode}, Total Questions: ${totalQuestions}`);
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
    socket.on('submit answer', async (roomCode, username, selectedAnswer, currentQuestionIndex, callback) => {
        // Fallback to socket properties if the values are null or undefined
        // roomCode, username, currentQuesitonIndex no longer necessary to be received
        roomCode = roomCode || socket.roomCode;
        username = username || socket.username;
        const gameInstance = roomsList[roomCode].gameInstance;
        currentQuestionIndex = currentQuestionIndex || gameInstance.currentQuestion;

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
            } else {
            answer = selectedAnswer;
            }
            // testing
            // console.log(selectedAnswer);
            // console.log(answer);

        // Check if gamemode is Trivia Board
        if (roomsList[roomCode].gameInstance.constructor.name === "TriviaBoard") { // Referenced https://stackoverflow.com/questions/1249531/how-to-get-a-javascript-objects-class
            let result = roomsList[roomCode].gameInstance.checkAnswer(username, answer, currentQuestionIndex);
            // Check if 30 questions have been answered, and if so, the game should end
            if (roomsList[roomCode].gameInstance.getNumberAnswered() === 30) {
                socketIO.to(roomCode).emit('game over', { message: 'The game is over' });
            }

            // Answer is correct
            if (result) {
                // The first person to answer correctly gets double points and to pick the next question
                if (!roomsList[roomCode].gameInstance.checkIfAnswered(currentQuestionIndex)) {
                    socketIO.to(roomCode).emit('next question selector', username);
                    // callback({ success: true, isFirstToAnswer: true });
                }
                else {
                    // callback({ success: true, isFirstToAnswer: false });
                }
            }
            // Answer is wrong
            else {
                // callback({ success: false });
            }
        // If the gamemode is RandomTrivia
          
        }else if (roomsList[roomCode].gameInstance.constructor.name === "RandomTrivia"){

            await roomsList[roomCode].gameInstance.storeAnswer(username, answer, currentQuestionIndex);
        }
        // All other gamemodes
        else
            roomsList[roomCode].gameInstance.checkAnswer(username, answer, currentQuestionIndex);

        //can emit to all connected clients using socketIO.emit, check to see if this is correct
        socketIO.to(roomCode).emit('update scores', roomsList[roomCode].gameInstance.scores);
        console.log(`[${new Date().toISOString()}] Answer submitted in room ${roomCode} by ${username}, Answer: ${answer}, Question Index: ${currentQuestionIndex}`);
        console.log(`[${new Date().toISOString()}] Updated scores: ${JSON.stringify(roomsList[roomCode].gameInstance.scores)}`);

        //testing
        //console.log("total question: ", roomsList[roomCode].gameInstance.totalQuestions);
        //console.log("current question index: ", currentQuestionIndex + 1);

        //endgame for all modes
        if (roomsList[roomCode].gameInstance.totalQuestions === (currentQuestionIndex + 1)) {
            roomsList[roomCode].gameInstance.playerDone(username);
            
            //TODO this is done, just commented out so as to not overpopulate the database when testing
            roomsList[roomCode].gameInstance.allPlayersDone();
        }
    });

    // Handle when buzzer is pressed 
    socket.on('buzzer pressed', () => {
        const roomCode = socket.roomCode;
        const username = socket.username;
        console.log(`[${new Date().toISOString()}] Buzzer in ${roomCode} from ${username}`);

        // socket.on submit answer 
        // check answer
        
        /* Removed first pressed buzzing
        socketIO.to(roomCode).emit('first pressed', username);
        */
    });

    // Handle when a person selects a Trivia Board question
    socket.on('selected question', (questionIndex) => {
        const roomCode = socket.roomCode;

        // Store current question index into gameInstance
        const gameInstance = roomsList[roomCode].gameInstance;
        gameInstance.currentQuestion = questionIndex;

        // Emits to the room what question index was picked
        socketIO.to(roomCode).emit('selected question', questionIndex);
    });

    // Handle going back to board after a question
    socket.on('back to board', () => {
        // Emits to everyone in room
        socketIO.to(socket.roomCode).emit('back to board');
    });

    // Handle game mode updates
    socket.on('update_game_mode', (roomCode, mode, callback) => {
        // Call errorCheck function
        if (errorCheck(roomCode, socket.username, 'change mode', callback)) {
            return;
        }

        roomsList[roomCode].settings.mode = mode;
        socketIO.to(roomCode).emit('game settings', { mode });
        callback({ success: true });
    });

    // Handle duration updates
    socket.on('update_duration', (roomCode, duration, callback) => {
        // Call errorCheck function
        if (errorCheck(roomCode, socket.username, 'change question duration', callback)) {
            return;
        }

        roomsList[roomCode].settings.duration = duration;
        socketIO.to(roomCode).emit('game settings', { duration });
        callback({ success: true });
    });

    // Handle topic updates
    socket.on('update_topic', (roomCode, topic, callback) => {
        // Call errorCheck function
        if (errorCheck(roomCode, socket.username, 'change topic', callback)) {
            return;
        }

        roomsList[roomCode].settings.topic = topic;
        socketIO.to(roomCode).emit('game settings', { topic });
        callback({ success: true });
    });

    // Handle total questions updates
    socket.on('update_total_questions', (roomCode, totalQuestions, callback) => {
        // Call errorCheck function
        if (errorCheck(roomCode, socket.username, 'change total questions', callback)) {
            return;
        }

        roomsList[roomCode].settings.totalQuestions = totalQuestions;
        socketIO.to(roomCode).emit('game settings', { totalQuestions });
        callback({ success: true });
    });

    // Handle Jeopardy topic updates
    socket.on('update_jeopardy_topic', (roomCode, index, topic, callback) => {
        // Call errorCheck function
        if (errorCheck(roomCode, socket.username, 'change Trivia Board topics', callback)) {
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
