// Followed tutorial from https://www.mongodb.com/resources/languages/mern-stack-tutorial
// Some code from https://expressjs.com/en/starter/hello-world.html
// Referenced https://masteringjs.io/tutorials/express/post
// Referenced https://github.com/expressjs/cors?tab=readme-ov-file
// Referenced https://socket.io/docs/v4/tutorial/introduction
// Used ChatGPT (asked about CORS, client-client and client-server communication, etc.)
const express = require('express');
const cors = require('cors');
const register = require('./routes/register.js');
const login = require('./routes/login.js');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { join } = require('node:path');

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

// Used for testing
/*app.get('/', (req, res) => {
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

    socket.on('disconnect', () => {
        console.log('A user disconnected')
    });
});
*/

server.listen(port, () => {
    console.log(`App available at http://localhost:${port}`);
});