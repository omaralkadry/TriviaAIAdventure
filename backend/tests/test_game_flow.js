require('dotenv').config();
const { ClassicTrivia } = require('../gamemodes');

async function testGameFlow() {
    console.log('Starting game flow test...');
    
    try {
        // Initialize game
        const game = new ClassicTrivia();
        console.log('Game instance created');
        
        // Set game parameters
        game.setSettings(3, 30, 10); // 3 questions, 30 seconds per question, 10 points per question
        game.setTopic('Biology');
        console.log('Game settings configured');
        
        // Add test players
        const players = ['testPlayer1', 'testPlayer2'];
        await game.startGame(10, 3, players, 'Biology', 30);
        console.log('Game started with players:', players);
        
        // Generate questions
        console.log('\nGenerating questions...');
        await game.generateQuestion();
        
        // Verify questions array
        console.log('\nVerifying questions array:');
        const questions = game.question_array;
        console.log(JSON.stringify(questions, null, 2));
        
        if (!Array.isArray(questions) || questions.length !== 3) {
            throw new Error(`Expected 3 questions, got ${questions?.length}`);
        }
        
        // Test each question's structure
        questions.forEach((q, idx) => {
            console.log(`\nValidating question ${idx + 1}:`);
            if (!q.question || !q.choices || !q.correctAnswer) {
                throw new Error(`Question ${idx + 1} is missing required fields`);
            }
            console.log('Question:', q.question);
            console.log('Choices:', q.choices);
            console.log('Correct Answer:', q.correctAnswer);
        });
        
        console.log('\nAll tests passed successfully!');
        
    } catch (error) {
        console.error('Error in game flow test:', error);
        throw error;
    }
}

// Run the test
testGameFlow().catch(console.error);
