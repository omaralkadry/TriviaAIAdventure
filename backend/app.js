// Some code from https://expressjs.com/en/starter/hello-world.html
// Some code from https://www.mongodb.com/resources/languages/mern-stack-tutorial
// Referenced https://masteringjs.io/tutorials/express/post
const express = require('express');
const register = require('./routes/register.js');
const login = require('./routes/login.js');

const app = express();
const port = 3000;


app.use(express.json());
app.use("/register", register);
app.use("/login", login);


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});