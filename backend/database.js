const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();


//some code taken from sample code on mongodb.com
class Database {
    constructor(uri) {
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
        console.log("Connection to MongoDB closed.");
    }
}

// Usage example
const uri = process.env.Database_Url;
const db = new Database(uri);

(async () => {
    try {
        await db.connect();
        // Perform database operations here
    } catch (error) {
        console.error("Error during database operations:", error);
    } finally {
        await db.close();
    }
})();

module.exports = Database;