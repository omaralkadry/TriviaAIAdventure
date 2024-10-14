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
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
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

        return result;
    }

    async authenticateUser(username, password) {
        const collection = this.client.db("General").collection("Accounts");
        const user = await collection.findOne({ username });
        if (!user) throw new Error('User not found.');
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid password.');
        
        return user;
    }

    async saveGame(username, gameID, score, rank) {
        const collection = this.client.db("Users").collection(username);
        try {
            await collection.insertOne({
                gameID: gameID,
                score: score,
                rank: rank,
                date: new Date()
            });
            //testing
            //console.log(`Game ${gameID} saved for user ${username}.`);
        } catch (error) {
            console.error(`Failed to save game for user ${username}:`, error);
            throw error;
        }
    }

}

// Usage example
/*
const uri = process.env.Database_Url;
const db = new Database(uri);

// (async () => {
//     try {
//         await db.connect();
//         // Perform database operations here

//         // Example: Register a user
//         await db.registerUser("player1", "securePassword");

//         // Example: Authenticate a user
//         const user = await db.authenticateUser("player1", "securePassword");
//         console.log("Authenticated User:", user);

    } catch (error) {
        console.error("Error during database operations:", error);
    } finally {
        await db.close();
    }
})();
//*/

module.exports = Database;