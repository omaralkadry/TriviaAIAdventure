// Used code from https://www.mongodb.com/resources/languages/mern-stack-tutorial
import express from "express";
import db from "../database.js";
import { ObjectId } from "mongodb";


const router = express.Router();

router.post("/", async (req, res) => {
    try {
        let newAccount = {
            username: req.body.username,
            password: req.body.password
        };
        
        let collection = await db.collection("Accounts");
        let result = await db.registerUser(username, password);

        res.send(result).status(204);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating account");        
    }
});