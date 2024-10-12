// Followed tutorial from https://www.mongodb.com/resources/languages/mern-stack-tutorial
// Some code from https://expressjs.com/en/starter/hello-world.html
// Referenced https://masteringjs.io/tutorials/express/post
// Referenced https://github.com/expressjs/cors?tab=readme-ov-file
// Referenced tutorial and documentation from https://socket.io/
// Used ChatGPT (asked about CORS, client-client and client-server communication, and more)
const express = require('express');
const cors = require('cors');
const register = require('./routes/register.js');
const login = require('./routes/login.js');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { join } = require('node:path');
const { ClassicTrivia } = require('./gamemodes.js');

const corsOptions = {
    origin: '*',
    // origin: 'http://localhost:5500', // Front-end URL
    methods: ["GET", "POST"],
    optionsSuccessStatus: 200 // Used for some legacy browsers
}

const app = express();
const port = 3000;

const server = createServer(app);
const socketIO = new Server(server, { cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json());
app.use("/register", register);
app.use("/login", login);

// Some code below is used for testing
app.get('/', (req, res) => {
    res.send("Test");
});

app.get('/test', (req, res) => {
    res.sendFile(join(__dirname, 'test_frontend.html'));
});

socketIO.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (msg) => {
        socketIO.emit('chat message', msg);
        console.log('Message: ' + msg);
    });

    // Called when frontend sends event to create a room
    socket.on('create room', (callback) => {
        // Used ChatGPT to see how to generate a random number in a range
        largestRoomNumber = 90000;
        smallestRoomNumber = 10000; 
        const roomCode = Math.floor(Math.random() * (largestRoomNumber - smallestRoomNumber + 1)) + smallestRoomNumber;

        // Joins the room
        socket.join(roomCode);

        // socketIO.to(roomCode).emit('test', "Message sent in a room");

        callback({
            // The room code is returned to the frontend
            roomCode: roomCode
        });
    });

    // Might not work correctly
    socket.on('generate questions', (callback) => {
        const classicTrivia = new ClassicTrivia();

        // Getting errors when this runs:
        // SyntaxError: Unexpected token S in JSON at position 0
        // SyntaxError: Unexpected token F in JSON at position 0
        questionsOutput = classicTrivia.generateQuestion();

        callback({
            // This currently returns all the parsed questions
            // We can alter this event or make a new one so it returns one question at a time
            questions: questionsOutput
        });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected')
    });
});

socketIO.on('connection', (socket) => {

});

server.listen(port, () => {
    console.log(`App available at http://localhost:${port}`);
});