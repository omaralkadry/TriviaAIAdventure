require('dotenv').config();
const OpenAI = require('openai');
const client = new OpenAI({apiKey: process.env['OPENAI_API_KEY']});

async function testQuestionGeneration() {
    const topic = "Biology";
    const totalQuestions = 2;
    
    const prompt = `Generate ${totalQuestions} trivia questions on the topic of "${topic}". Each question must have four multiple-choice answers. Format your response EXACTLY as a JSON object with a questions array like this example:
{
    "questions": [
        {
            "question": "Sample question?",
            "choices": {
                "a": "First choice",
                "b": "Second choice",
                "c": "Third choice",
                "d": "Fourth choice"
            },
            "correctAnswer": "a"
        }
    ]
}
Important: Ensure the response is a valid JSON object containing exactly ${totalQuestions} question objects in the questions array.`;

    try {
        console.log('Sending request to OpenAI...');
        const response = await client.chat.completions.create({
            model: "gpt-4",
            messages: [
                { 
                    role: "system", 
                    content: "You are a trivia game question generator. You must respond with a valid JSON object containing a questions array. No markdown, no explanations, just the JSON object." 
                },
                { role: "user", content: prompt }
            ],
            max_tokens: 200 * totalQuestions,
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        let result = response.choices[0].message.content;
        console.log('\nRaw API Response:', result);

        // Try direct parse first
        try {
            console.log('\nAttempting direct JSON parse...');
            const parsedResult = JSON.parse(result);
            console.log('Direct parse successful:', JSON.stringify(parsedResult, null, 2));
            return;
        } catch (directParseError) {
            console.log('Direct parse failed:', directParseError.message);
        }

        // Clean the response
        console.log('\nCleaning response...');
        result = result.replace(/```json|```/g, '').trim();
        
        // Find the first { and last }
        const startIdx = result.indexOf('{');
        const endIdx = result.lastIndexOf('}');
        
        if (startIdx === -1 || endIdx === -1) {
            throw new Error('Response does not contain a JSON object');
        }
        
        result = result.slice(startIdx, endIdx + 1);
        
        // Remove trailing commas
        result = result.replace(/,(\s*[\]}])/g, '$1');
        
        // Remove non-JSON characters
        result = result.replace(/[^\x20-\x7E]/g, '');
        
        console.log('\nCleaned JSON:', result);
        
        // Try parsing cleaned result
        console.log('\nAttempting to parse cleaned JSON...');
        const parsedResult = JSON.parse(result);
        console.log('Parse successful:', JSON.stringify(parsedResult, null, 2));
        
        // Validate structure
        const questions = parsedResult.questions || parsedResult;
        if (!Array.isArray(questions)) {
            throw new Error('Parsed result does not contain a valid questions array');
        }
        
        console.log('\nValidation successful! Found', questions.length, 'questions');
    } catch (error) {
        console.error('\nError:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
console.log('Starting JSON parsing test...');
testQuestionGeneration().then(() => {
    console.log('\nTest complete');
    process.exit(0);
}).catch(error => {
    console.error('\nTest failed:', error);
    process.exit(1);
});
