require('dotenv').config();
const { ClassicTrivia } = require('./gamemodes');

async function testQuestionGeneration() {
    console.log('Starting question generation test...');
    const trivia = new ClassicTrivia();
    
    try {
        console.log('Attempting to generate question...');
        const question = await trivia.generateQuestion('Biology', 1);
        console.log('Successfully generated question:');
        console.log(JSON.stringify(question, null, 2));
    } catch (error) {
        console.error('Error during question generation:');
        console.error(error);
        
        if (error.response) {
            console.log('OpenAI API Response:', error.response.data);
        }
    }
}

testQuestionGeneration().catch(console.error);
