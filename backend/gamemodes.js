//const {OpenAI}  = require('openai');
//const client = new OpenAI();
//some code taken from openai.com

require('dotenv').config();
const OpenAI = require('openai');
const client = new OpenAI({apiKey: process.env['OPENAI_API_KEY']});

const Database = require('./database')



class GameMode {
    constructor(playerCount = 1) {
        this.players = [];
        this.totalQuestions = 5;
        this.currentRound = 0;
        this.timePerQuestion = 0;
        this.currentQuestion = 0;
        this.scores = {};
        this.ranks = {};
        this.pointsperquestion = 10;
        this.gameID = '';
    }

    addPlayer(player) {
        this.players.push(player);
        this.scores[player] = 0; 
    }

    setSettings(totalQuestions, timePerQuestion, pointsperquestion) {
        this.totalQuestions = totalQuestions;
        this.timePerQuestion = timePerQuestion;
        this.pointsperquestion = pointsperquestion;
    }

    async time() {
        return this.timePerQuestion;
    }

    startGame() {
        throw new Error('TODO: implement in the subclass');
    }

    generateQuestion() {
        throw new Error('TODO: implement in the subclass');
    }

    checkAnswer(player, answer) {
        throw new Error('TODO: implement in the subclass');
    }

    generateScores(player) {
        //console.log(this.pointsperquestion);
        this.scores[player] += this.pointsperquestion;
        //console.log(this.scores[player]);
        //console.log(this.scores);
    }

    //function created with chatgpt
    //not tested
    async endGame() {
        //let winner = Object.keys(this.scores).reduce((a, b) => this.scores[a] > this.scores[b] ? a : b);
        //console.log(`Game Over! Winner is ${winner} with ${this.scores[winner]} points!`);
        const ordered_scores = Object.entries(this.scores);
        ordered_scores.sort((a,b)=> b[1] - a[1])
        
        let currentRank = 0;
        let lastScore = null;

        ordered_scores.forEach(([player, score]) => {
            if (lastScore === null || score != lastScore) {
                currentRank++;  
            } 
            this.ranks[player] = currentRank;
            lastScore = score;
        })



        const uri = process.env.Database_Url;
        const db = new Database(uri);

        await Promise.all(this.players.map(async (player) => {
            const score = this.scores[player];
            const rank = this.ranks[player];
            const gameID = this.gameID;
            await db.saveGame(player, gameID, score, rank);
        }));
        db.close();
        
    }
}



class ClassicTrivia extends GameMode {
    constructor(playerCount = 1) {
        super(playerCount);
        this.topic = '';
        this.question_array = [];
    }
   
    setTopic(topic) {
        this.topic = topic;
    }

    // from parent class
    async startGame(pointsperquestion, totalQuestions, usernames, topic, duration) {
        this.setSettings(totalQuestions, duration, pointsperquestion)
        this.gameID = 'Classic';
        this.setTopic(topic);
        if (!Array.isArray(usernames) || usernames.length === 0) {
            throw new Error('Usernames must be a non-empty array.');
        }
        //testing
        //console.log(this.scores);
        //console.log(usernames);
        usernames.forEach(name => {
            this.addPlayer(name);
            //console.log(this.scores[name]);
        });

        //testing
        //console.log(this.scores);
        //may adjust here if you want to call generatequestion
    }

    checkAnswer(player, answer, qindex) {
        
        // if (answer == this.question_array[this.currentQuestion].correctAnswer)
        //    this.generateScores(player);
        if (answer == this.question_array[qindex].correctAnswer)
            this.generateScores(player);

    }


    async generateQuestion() {
        try {
            const prompt = `Generate ${this.totalQuestions} trivia questions on the topic of "${this.topic}". Each question must have four multiple-choice answers. Format your response EXACTLY as a JSON object with a questions array like this example:
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
Important: Ensure the response is a valid JSON object containing exactly ${this.totalQuestions} question objects in the questions array.`;

            console.log('Sending request to OpenAI...');
            const response = await client.chat.completions.create({
                model: "gpt-4", //most cost effective as of rn
                messages: [
                    { role: "system", content: "You are a trivia game question generator. You must respond with a valid JSON object containing a questions array. No markdown, no explanations, just the JSON object." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 200 * this.totalQuestions,  //may not be neccessary or might adjust
                temperature: 0.7
            });

            //testing
            //console.log('Full OpenAI API Response:', JSON.stringify(response, null, 2));

            let result = response.choices[0].message.content;

            // Log raw response for debugging
            console.log('Raw API Response:', result);

            // Log characters around position 222 for debugging
            const start = Math.max(0, 222 - 20);
            const end = Math.min(result.length, 222 + 20);
            console.log('Characters around position 222:', JSON.stringify(result.slice(start, end)));
            console.log('Character at position 222:', JSON.stringify(result.charAt(222)));

            // Enhanced cleaning process
            // Remove markdown code blocks and any non-printable characters
            result = result.replace(/```(?:json)?\s*|\s*```/g, '').trim();
            result = result.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

            // Remove any BOM or hidden characters
            result = result.replace(/^\uFEFF/, '');

            // Remove any stray characters outside of JSON structure
            const startIdx = result.indexOf('{');
            const endIdx = result.lastIndexOf('}');

            if (startIdx === -1 || endIdx === -1) {
                console.error('JSON boundaries not found in:', result);
                throw new Error('Response does not contain a valid JSON object structure');
            }

            // Extract only the JSON object and log the extraction
            result = result.slice(startIdx, endIdx + 1);
            console.log('After boundary extraction:', result);

            // Enhanced cleaning of common JSON formatting issues
            result = result
                .replace(/,(\s*[\]}])/g, '$1') // Remove trailing commas
                .replace(/\\n/g, ' ') // Replace newlines with spaces
                .replace(/\\"/g, '"') // Fix escaped quotes
                .replace(/\s+/g, ' ') // Normalize whitespace
                .replace(/[^\x20-\x7E]/g, ''); // Remove any remaining non-printable characters

            console.log('Cleaned JSON:', result);

            // Try parsing with detailed error handling
            try {
                const parsedResult = JSON.parse(result);

                // Handle both direct array and nested object formats
                let questions;
                if (Array.isArray(parsedResult)) {
                    questions = parsedResult;
                } else if (parsedResult.questions && Array.isArray(parsedResult.questions)) {
                    questions = parsedResult.questions;
                } else {
                    throw new Error('Invalid response format: missing questions array');
                }

                if (questions.length === 0) {
                    throw new Error('No questions were generated');
                }

                if (questions.length !== this.totalQuestions) {
                    console.warn(`Warning: Received ${questions.length} questions, expected ${this.totalQuestions}`);
                }

                // Validate each question's structure and content
                questions.forEach((q, idx) => {
                    // Validate question text
                    if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
                        throw new Error(`Question ${idx + 1}: Invalid or missing question text`);
                    }

                    // Validate choices object
                    if (!q.choices || typeof q.choices !== 'object' || Array.isArray(q.choices)) {
                        throw new Error(`Question ${idx + 1}: Invalid or missing choices object`);
                    }

                    // Validate choice keys and values
                    const requiredKeys = ['a', 'b', 'c', 'd'];
                    const choiceKeys = Object.keys(q.choices);

                    if (!requiredKeys.every(key => choiceKeys.includes(key))) {
                        throw new Error(`Question ${idx + 1}: Missing required choice keys (a, b, c, d)`);
                    }

                    if (!choiceKeys.every(key => requiredKeys.includes(key))) {
                        throw new Error(`Question ${idx + 1}: Invalid choice keys found`);
                    }

                    // Validate choice values
                    Object.values(q.choices).forEach((choice, choiceIdx) => {
                        if (typeof choice !== 'string' || choice.trim().length === 0) {
                            throw new Error(`Question ${idx + 1}: Invalid or empty choice text at position ${choiceIdx + 1}`);
                        }
                    });

                    // Validate correct answer
                    if (!q.correctAnswer || !requiredKeys.includes(q.correctAnswer)) {
                        throw new Error(`Question ${idx + 1}: Invalid or missing correct answer`);
                    }
                });

                console.log(`Successfully validated ${questions.length} questions`);
                this.question_array = questions;

            } catch (parseError) {
                console.error('Error processing questions:', parseError.message);
                throw new Error(`Failed to process questions: ${parseError.message}`);
            }

        } catch (error) {
            console.error('Error generating question:', error);
            throw error; // Re-throw to handle at caller level
        }
    }

    async getQuestionArray() {
        return this.question_array;
    }
    async getQuestion(question_array) {
        return this.question_array[this.currentQuestion].question;
    }
    async getChoices(question_array) {
        return this.question_array[this.currentQuestion].choices;
    }
    async getAnswer(question_array) {
        return this.question_array[this.currentQuestion].correctAnswer;
    }
    async incrementQuestion(question_array) {
        this.currentQuestion = this.currentQuestion + 1;
    }

    /* Not being used anymore
    parseTriviaResponse(response) {
        // Using regex rn may find better way
        const questionRegex = /Question: (.*)/;
        const choiceRegex = /([a-d])\) (.*)/g;
        const correctAnswerRegex = /Correct Answer: ([a-d])/;

        const questionMatch = questionRegex.exec(response);
        const choicesMatch = [...response.matchAll(choiceRegex)];
        const correctAnswerMatch = correctAnswerRegex.exec(response);

        if (!questionMatch || choicesMatch.length === 0 || !correctAnswerMatch) {
            throw new Error('Failed to parse the trivia response.');
        }

        const question = questionMatch[1];
        const choices = choicesMatch.map(match => ({ letter: match[1], choice: match[2] }));
        const correctAnswer = correctAnswerMatch[1];


        return {
            question,
            choices,
            correctAnswer
        };
    }
    */

    //TODO May not be used anymore
    /*
    async getPlayerAnswer(player) {

        //assisted by chatgpt
        return new Promise((resolve) => {
            const checkAnswer = setInterval(() => {
                if (playerAnswers[player]) {
                    const answer = playerAnswers[player];
                    clearInterval(checkAnswer);
                    resolve(answer);
                }
            }, 1000);
        });
    }
    */

}

class Jeopardy extends GameMode {
    constructor(playerCount = 1) {
        super(playerCount);
        this.topics = [
            'History', 'Science', 'Geography',
            'Literature', 'Sports', 'Entertainment'
        ];
        this.categories = [];
        this.questions = {};
        this.pointValues = [200, 400, 600, 800, 1000];
        this.answeredQuestions = new Set();
    }

    setTopics(topics) {
        if (Array.isArray(topics) && topics.length > 0) {
            this.topics = topics;
        } else {
            this.topics = ['History', 'Science', 'Geography', 'Literature', 'Sports'];
        }
    }

    async startGame(pointsperquestion, totalQuestions, usernames, topics, duration) {
        this.setSettings(totalQuestions, duration, pointsperquestion);
        this.gameID = 'Jeopardy';

        // Ensure we have topics, or use defaults
        if (!topics || !Array.isArray(topics) || topics.length === 0) {
            topics = ['History', 'Science', 'Geography', 'Literature', 'Sports'];
        }
        this.setTopics(topics);

        if (!Array.isArray(usernames) || usernames.length === 0) {
            throw new Error('Usernames must be a non-empty array.');
        }
        usernames.forEach(name => {
            this.addPlayer(name);
        });
        await this.generateCategories();
    }

    async generateCategories() {
        try {
            this.categories = [];
            this.questions = {};

            for (let topic of this.topics) {
                if (!topic) continue;

                const prompt = `Generate 5 Jeopardy-style questions for the category "${topic}" with increasing difficulty from 200 to 1000 points. Format your response EXACTLY as a JSON object like this:
                {
                    "category": "${topic}",
                    "questions": [
                        {
                            "value": 200,
                            "question": "This is a sample question?",
                            "answer": "This is the answer"
                        },
                        {
                            "value": 400,
                            "question": "Another question?",
                            "answer": "Another answer"
                        }
                    ]
                }`;

                const response = await client.chat.completions.create({
                    model: "gpt-4",
                    messages: [
                        { role: "system", content: "You are a Jeopardy question generator. Generate questions with increasing difficulty and clear, concise answers." },
                        { role: "user", content: prompt }
                    ],
                    max_tokens: 1000,
                });

                const result = response.choices[0].message.content;
                // Clean and extract JSON
                const jsonStart = result.indexOf('{');
                const jsonEnd = result.lastIndexOf('}') + 1;
                const cleanedResult = result.slice(jsonStart, jsonEnd).trim();

                try {
                    const parsedCategory = JSON.parse(cleanedResult);
                    if (parsedCategory && parsedCategory.category && Array.isArray(parsedCategory.questions)) {
                        this.categories.push(parsedCategory.category);
                        this.questions[parsedCategory.category] = parsedCategory.questions;
                    }
                } catch (parseError) {
                    console.error('Error parsing category JSON:', parseError);
                }
            }
        } catch (error) {
            console.error('Error generating Jeopardy categories:', error);
            // Initialize with empty values if generation fails
            this.categories = [];
            this.questions = {};
        }
    }

    isQuestionAnswered(category, value) {
        return this.answeredQuestions.has(`${category}-${value}`);
    }

    async generateWrongAnswers(category, correctAnswer) {
        try {
            const prompt = `Generate 3 plausible but incorrect answers for a Jeopardy question in the category "${category}" where the correct answer is "${correctAnswer}". Format as JSON array.`;

            const response = await client.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "Generate plausible but incorrect Jeopardy answers that are related to the category." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 200
            });

            const result = response.choices[0].message.content;
            try {
                const answers = JSON.parse(result);
                return Array.isArray(answers) ? answers.slice(0, 3) : this.getDefaultWrongAnswers();
            } catch (error) {
                return this.getDefaultWrongAnswers();
            }
        } catch (error) {
            return this.getDefaultWrongAnswers();
        }
    }

    getDefaultWrongAnswers() {
        return [
            "Incorrect Answer",
            "Wrong Choice",
            "Invalid Option"
        ];
    }

    checkAnswer(player, answer, category, value) {
        const categoryQuestions = this.questions[category];
        const question = categoryQuestions.find(q => q.value === value);

        if (!question) return false;

        const isCorrect = answer.toLowerCase() === question.answer.toLowerCase();
        if (isCorrect) {
            this.scores[player] += value;
        } else {
            this.scores[player] -= value;
        }

        this.answeredQuestions.add(`${category}-${value}`);
        return isCorrect;
    }

    getBoard() {
        const board = {};
        // Initialize board with categories and their questions
        this.categories.forEach(category => {
            if (this.questions[category]) {
                board[category] = this.questions[category].map(question => ({
                    value: question.value,
                    question: question.question,
                    answer: question.answer,
                    answered: this.isQuestionAnswered(category, question.value)
                }));
            }
        });
        return board;
    }

    getQuestion(category, value) {
        const categoryQuestions = this.questions[category];
        if (!categoryQuestions) return null;

        const question = categoryQuestions.find(q => q.value === value);
        return question ? question.question : null;
    }

    async getQuestionArray() {
        const transformedQuestions = [];
        for (const category of this.categories) {
            const categoryQuestions = this.questions[category];
            if (!categoryQuestions) continue;

            for (const question of categoryQuestions) {
                // Generate plausible wrong answers based on the category context
                const wrongAnswers = await this.generateWrongAnswers(category, question.answer);

                transformedQuestions.push({
                    question: `[${category} - ${question.value}] ${question.question}`,
                    choices: {
                        a: question.answer,
                        b: wrongAnswers[0] || "Incorrect answer 1",
                        c: wrongAnswers[1] || "Incorrect answer 2",
                        d: wrongAnswers[2] || "Incorrect answer 3"
                    },
                    correctAnswer: 'a',
                    category: category,
                    value: question.value
                });
            }
        }
        return transformedQuestions;
    }

    isGameOver() {
        return this.answeredQuestions.size === (this.categories.length * this.pointValues.length);
    }
}

class TriviaCrack extends GameMode {
    constructor(playerCount = 1) {
        super(playerCount);
        this.topic = '';
        this.question_array = [];
        this.categories = ['Science', 'History', 'Geography', 'Entertainment', 'Sports', 'Art'];
        this.currentCategory = 0;
    }

    setTopic(topic) {
        this.topic = topic;
    }

    async startGame(pointsperquestion, totalQuestions, usernames, topic, duration) {
        this.setSettings(totalQuestions, duration, pointsperquestion);
        this.gameID = 'TriviaCrack';
        this.setTopic(topic);
        if (!Array.isArray(usernames) || usernames.length === 0) {
            throw new Error('Usernames must be a non-empty array.');
        }
        usernames.forEach(name => {
            this.addPlayer(name);
        });
        await this.generateQuestion();
    }

    checkAnswer(player, answer, questionIndex) {
        if (questionIndex >= this.question_array.length) return false;
        const isCorrect = answer === this.question_array[questionIndex].correctAnswer;
        if (isCorrect) {
            this.scores[player] += this.pointsperquestion;
        }
        return isCorrect;
    }

    async generateQuestion() {
        try {
            const category = this.categories[this.currentCategory];
            const prompt = `Generate a multiple choice question about ${category}. Format as JSON:
            {
                "question": "<question>",
                "choices": {
                    "a": "<correct answer>",
                    "b": "<wrong answer 1>",
                    "c": "<wrong answer 2>",
                    "d": "<wrong answer 3>"
                },
                "correctAnswer": "a"
            }`;

            const response = await client.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a trivia question generator." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 1000,
            });

            const result = response.choices[0].message.content;
            const cleanedResult = result.replace(/```json|```/g, '').trim();
            const question = JSON.parse(cleanedResult);
            this.question_array.push(question);
            this.currentCategory = (this.currentCategory + 1) % this.categories.length;
        } catch (error) {
            console.error('Error generating TriviaCrack question:', error);
        }
    }

    async getQuestionArray() {
        return this.question_array;
    }
}

module.exports = { GameMode, ClassicTrivia, Jeopardy, TriviaCrack };
