const Database = require('../database');

describe('Database Connection', () => {
    let db;

    beforeAll(async () => {
        const uri = process.env.Database_Url; // Ensure this is set in your environment
        db = new Database(uri);
        await db.connect();
    });

    afterAll(async () => {
        await db.close();
    });

    test('should connect to the database successfully', () => {
        expect(db.client).toBeDefined(); // Ensure the client is defined
    });
});

// Test creating a new user
// Referenced code from: https://jestjs.io/docs/mongodb
// Referenced: https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html
describe('Create new user', () => {
    let db;
    let username = "testuser";
    let password = "testpassword";
    let collection;
    let user;

    beforeAll(async () => {
        const uri = process.env.Database_Url;
        db = new Database(uri);
        await db.connect();
    });

    afterAll(async () => {
        // Deletes user from database if user was successfully created
        if (user) {
            await collection.deleteOne({ username });
        }
        await db.close();
    });

    test('should create a new user', async () => {
        await db.registerUser(username, password);

        collection = db.client.db("General").collection("Accounts");
        user = await collection.findOne({ username });

        expect(user).toBeTruthy();
    });
});