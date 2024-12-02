require('dotenv').config();
const OpenAI = require('openai');

// Initialize OpenAI client with explicit API key from env
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function testJsonParsing() {
    try {
        // Simple, controlled test with just one question
        const prompt = `Generate 1 trivia question on the topic of "Biology". Format your response EXACTLY as a JSON object like this:
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
}`;

        console.log('Starting JSON parsing test...');
        console.log('API Key available:', !!process.env.OPENAI_API_KEY);
        
        const response = await client.chat.completions.create({
            model: "gpt-4",
            messages: [
                { 
                    role: "system", 
                    content: "You are a trivia question generator. Respond with ONLY a valid JSON object. No markdown, no explanations." 
                },
                { role: "user", content: prompt }
            ],
            max_tokens: 200,
            temperature: 0.7
        });

        let result = response.choices[0].message.content;
        
        // Log each step of the cleaning process
        console.log('\nRaw API Response:', result);
        
        // Step 1: Remove markdown
        result = result.replace(/```(?:json)?\s*|\s*```/g, '').trim();
        console.log('\nAfter markdown removal:', result);
        
        // Step 2: Remove non-printable characters
        result = result.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        console.log('\nAfter non-printable removal:', result);
        
        // Step 3: Find JSON boundaries
        const startIdx = result.indexOf('{');
        const endIdx = result.lastIndexOf('}');
        if (startIdx === -1 || endIdx === -1) {
            throw new Error('No valid JSON object boundaries found');
        }
        result = result.slice(startIdx, endIdx + 1);
        console.log('\nAfter finding JSON boundaries:', result);
        
        // Step 4: Clean common JSON issues
        result = result
            .replace(/,(\s*[\]}])/g, '$1')
            .replace(/\\n/g, ' ')
            .replace(/\\"/g, '"')
            .replace(/\s+/g, ' ');
        console.log('\nAfter cleaning common issues:', result);
        
        // Try parsing
        const parsed = JSON.parse(result);
        console.log('\nSuccessfully parsed JSON:', JSON.stringify(parsed, null, 2));
        
    } catch (error) {
        console.error('Error in test:', error);
        if (error.response) {
            console.error('OpenAI API Error:', error.response.data);
        }
    }
}

testJsonParsing().catch(console.error);
