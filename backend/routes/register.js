// Used code from https://www.mongodb.com/resources/languages/mern-stack-tutorial
const express = require('express');
const database = require('../database.js');

const uri = process.env.Database_Url; // Ensure this is set in your environment
let db = new database(uri);

const router = express.Router();


// POST /register route
// Registers a user
router.post("/", async (req, res) => {
    //TODO disable or enable registration here
    // return res.status(403).send("Registration is currently disabled.");
    try {
        const username = req.body.username;
        const password = req.body.password;

        let result = await db.registerUser(username, password);

        res.status(201).send(result);
    } catch (err) {
        console.error(err);
        res.status(403).send(err.name + ": " + err.message);        
    }
});

module.exports = router;