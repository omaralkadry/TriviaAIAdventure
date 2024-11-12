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
        this.isConnected = false;
    }

    async connect() {
        try {
            if (!this.isConnected) {
                await this.client.connect();
                await this.client.db("admin").command({ ping: 1 });
                console.log("Pinged your deployment. You successfully connected to MongoDB!");
                this.isConnected = true;
            }
        } catch (error) {
            console.error("Connection failed:", error);
            this.isConnected = false;
            throw error;
        }
    }

    async close() {
        await this.client.close();
        this.isConnected = false;
        //console.log("Connection to MongoDB closed.");
    }

    async registerUser(username, password) {
        if (!this.isConnected) {
            await this.connect();
        }
        try {
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
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    }

    async authenticateUser(username, password) {
        if (!this.isConnected) {
            await this.connect();
        }
        try {
            const collection = this.client.db("General").collection("Accounts");
            const user = await collection.findOne({ username });
            if (!user) throw new Error('User not found.');

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) throw new Error('Invalid password.');

            return user;
        } catch (error) {
            console.error("Authentication error:", error);
            throw error;
        }
    }

    async saveGame(username, gameID, score, rank) {
        if (!this.isConnected) {
            await this.connect();
        }
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
