class OpenAI {
    constructor(config) {
        if (!config || !config.apiKey) {
            throw new Error('API key is required');
        }
        this.apiKey = config.apiKey;
    }

    chat = {
        completions: {
            create: async ({ model, messages, max_tokens }) => {
                // Simulate OpenAI response format
                return {
                    choices: [{
                        message: {
                            content: JSON.stringify([{
                                question: "What is the capital of France?",
                                choices: {
                                    a: "London",
                                    b: "Berlin",
                                    c: "Paris",
                                    d: "Madrid"
                                },
                                correctAnswer: "c"
                            }])
                        }
                    }]
                };
            }
        }
    };
}

module.exports = OpenAI;
