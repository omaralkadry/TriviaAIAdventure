require('dotenv').config();
const { ClassicTrivia } = require('../gamemodes');

async function testClassicTrivia() {
    console.log('Testing ClassicTrivia question generation...');
    const game = new ClassicTrivia();
    game.totalQuestions = 2; // Small number for testing
    
    try {
        await game.generateQuestion();
        console.log('Successfully generated questions:');
        console.log(JSON.stringify(game.question_array, null, 2));
    } catch (error) {
        console.error('Error generating questions:', error);
    }
}

testClassicTrivia().catch(console.error);
