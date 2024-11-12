require('dotenv').config();
const { ClassicTrivia, Jeopardy, TriviaCrack } = require('../gamemodes');

async function testAllGameModes() {
    console.log('Testing all game modes...\n');

    // Test Classic Trivia
    console.log('=== Testing Classic Trivia ===');
    const classicGame = new ClassicTrivia();
    classicGame.totalQuestions = 2;
    try {
        await classicGame.generateQuestion();
        console.log('Classic Trivia questions:');
        console.log(JSON.stringify(classicGame.question_array, null, 2));
    } catch (error) {
        console.error('Classic Trivia error:', error);
    }

    // Test Jeopardy
    console.log('\n=== Testing Jeopardy ===');
    const jeopardyGame = new Jeopardy();
    try {
        await jeopardyGame.generateCategories();
        console.log('Jeopardy categories:');
        console.log(JSON.stringify(jeopardyGame.getBoard(), null, 2));
    } catch (error) {
        console.error('Jeopardy error:', error);
    }

    // Test TriviaCrack
    console.log('\n=== Testing TriviaCrack ===');
    const triviaCrackGame = new TriviaCrack();
    try {
        await triviaCrackGame.generateQuestion();
        console.log('TriviaCrack questions:');
        console.log(JSON.stringify(triviaCrackGame.question_array, null, 2));
    } catch (error) {
        console.error('TriviaCrack error:', error);
    }
}

testAllGameModes().catch(console.error);
