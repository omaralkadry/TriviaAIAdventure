const express = require('express');
const database = require('../database.js');

const uri = process.env.Database_Url; // Ensure this is set in your environment
let db = new database(uri);

const router = express.Router();


router.post('/', async (req, res) => {
    console.log("arrived in back");
    const  {username} = req.body;
    try {
        let userGames = await db.getAllGamesForUser(username);

        if (!userGames || userGames.length === 0) {
            return res.status(404).json({ error: 'No game history found for this user.' });
        }
        console.log("history.js");
        res.status(200).json(userGames); // Send back the game history
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;