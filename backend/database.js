const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();


//some code taken from sample code on mongodb.com
class Database {
    constructor(uri) {
        if (!uri) {
            throw new Error('MongoDB connection URI is not defined. Please set the Database_Url in your .env file.');
        }

        this.client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
        });
    }

    async connect() {
        try {
            await this.client.connect();
            await this.client.db("admin").command({ ping: 1 });
            // console.log("Pinged your deployment. You successfully connected to MongoDB!");
        } catch (error) {
            console.error("Connection failed:", error);
            throw error;
        }
    }

    async close() {
        await this.client.close();
        //console.log("Connection to MongoDB closed.");
    }

    async registerUser(username, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const collection = this.client.db("General").collection("Accounts");
        const existingUser = await collection.findOne({ username });

        if (existingUser) {
            throw new Error('Username already exists.');
        }

        const result = await collection.insertOne({ username, password: hashedPassword });
        await this.client.db("Users").createCollection(username);

        // Finds newly inserted document user data to be returned in the response
        const inserted = await collection.findOne({ username });

        return inserted;
    }

    async authenticateUser(username, password) {
        const collection = this.client.db("General").collection("Accounts");
        const user = await collection.findOne({ username });
        if (!user) throw new Error('User not found.');
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid password.');
        
        return user;
    }

    async saveGame(username, gameID, score, rank, qNum) {
        const collection = this.client.db("Users").collection(username);
        try {
            await collection.insertOne({
                gameID: gameID,
                score: score,
                rank: rank,
                questionAmount: qNum,
                date: new Date()
            });
            //testing
            //console.log(`Game ${gameID} saved for user ${username}.`);
        } catch (error) {
            console.error(`Failed to save game for user ${username}:`, error);
            throw error;
        }
    }

    async getAllGamesForUser(username) {
        const collection = this.client.db("Users").collection(username);
        try {
            
            const games = await collection.find().toArray();
            return games;
        } catch (error) {
            console.error(`Failed to retrieve games for user ${username}:`, error);
            throw error; 
        }
    }

}

module.exports = Database;