// Followed tutorial from https://www.mongodb.com/resources/languages/mern-stack-tutorial
// Some code from https://expressjs.com/en/starter/hello-world.html
// Referenced https://masteringjs.io/tutorials/express/post
// Referenced https://github.com/expressjs/cors?tab=readme-ov-file
// Asked ChatGPT about how to use CORS
const express = require('express');
const cors = require('cors');
const register = require('./routes/register.js');
const login = require('./routes/login.js');

const corsOptions = {
    origin: '*',
    // origin: 'http://google.com', // Front-end URL maybe
    optionsSuccessStatus: 200 // Used for some legacy browsers
}

const app = express();
const port = 3000;

app.use(cors(corsOptions));
app.use(express.json());
app.use("/register", register);
app.use("/login", login);


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});