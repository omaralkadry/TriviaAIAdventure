// Some code from https://expressjs.com/en/starter/hello-world.html
// Some code from https://www.mongodb.com/resources/languages/mern-stack-tutorial
import express from "express";
import register from "./routes/register.js";

const app = express();
const port = 3000;


app.use(express.json());
app.use("/register", register);


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});