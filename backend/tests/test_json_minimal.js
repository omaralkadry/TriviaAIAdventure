// Minimal test case for JSON parsing
const fs = require('fs');

// Test data that matches the expected format
const testData = {
    questions: [
        {
            question: "What is the powerhouse of the cell?",
            choices: {
                a: "Nucleus",
                b: "Mitochondria",
                c: "Ribosome",
                d: "Endoplasmic Reticulum"
            },
            correctAnswer: "b"
        }
    ]
};

// Function to test JSON cleaning and parsing
function testJsonCleaning(input) {
    console.log('Starting JSON cleaning test...');
    console.log('\nInput data:', JSON.stringify(input, null, 2));
    
    try {
        // Convert to string to simulate API response
        let result = JSON.stringify(input);
        
        // Add some common issues to test cleaning
        result = '```json\n' + result + '\n```';
        result = result.replace(/"/g, '\\"').replace(/\\"/g, '"');
        
        console.log('\nSimulated raw response:', result);
        
        // Clean the response
        result = result.replace(/```(?:json)?\s*|\s*```/g, '').trim();
        console.log('\nAfter markdown removal:', result);
        
        result = result.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        console.log('\nAfter non-printable removal:', result);
        
        const startIdx = result.indexOf('{');
        const endIdx = result.lastIndexOf('}');
        if (startIdx === -1 || endIdx === -1) {
            throw new Error('No valid JSON object boundaries found');
        }
        result = result.slice(startIdx, endIdx + 1);
        console.log('\nAfter finding JSON boundaries:', result);
        
        result = result
            .replace(/,(\s*[\]}])/g, '$1')
            .replace(/\\n/g, ' ')
            .replace(/\\"/g, '"')
            .replace(/\s+/g, ' ');
        console.log('\nAfter cleaning common issues:', result);
        
        // Try parsing
        const parsed = JSON.parse(result);
        console.log('\nSuccessfully parsed JSON:', JSON.stringify(parsed, null, 2));
        
        // Validate structure
        if (!parsed.questions || !Array.isArray(parsed.questions)) {
            throw new Error('Missing or invalid questions array');
        }
        
        parsed.questions.forEach((q, idx) => {
            if (!q.question || !q.choices || !q.correctAnswer) {
                throw new Error(`Question ${idx + 1} is missing required fields`);
            }
            
            const requiredKeys = ['a', 'b', 'c', 'd'];
            if (!requiredKeys.every(key => q.choices[key])) {
                throw new Error(`Question ${idx + 1} is missing required choice keys`);
            }
        });
        
        console.log('\nValidation successful!');
        return parsed;
        
    } catch (error) {
        console.error('\nError in test:', error.message);
        throw error;
    }
}

// Run the test
try {
    const result = testJsonCleaning(testData);
    console.log('\nTest completed successfully');
} catch (error) {
    console.error('\nTest failed:', error.message);
}
