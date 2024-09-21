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