// Used code from https://www.mongodb.com/resources/languages/mern-stack-tutorial
const express = require('express');
const database = require('../database.js');

const uri = process.env.Database_Url; // Ensure this is set in your environment
let db = new database(uri);

const router = express.Router();


// POST /login route
// Authenticates a user
router.post("/", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        let result = await db.authenticateUser(username, password);

        // Currently, the result variable returns the _id, username, and hashed password of the user
        // May not want to return the password
        res.status(200).send(result);
    } catch (err) {
        console.error(err);
        // TODO: Maybe return different error codes for different errors
        res.status(403).send(err.name + ": " + err.message);        
    }
});

module.exports = router;