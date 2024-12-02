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
        this.finishedGame = {}
        this.playersAnswered = 0;
    }

    addPlayer(player) {
        this.players.push(player);
        this.scores[player] = 0; 
        this.finishedGame[player] = false;
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
        throw new Error('Implement in the subclass');
    }

    generateQuestion() {
        throw new Error('Implement in the subclass');
    }

    checkAnswer(player, answer) {
        throw new Error('Implement in the subclass');
    }

    generateScores(player) {
        //console.log(this.pointsperquestion);
        this.scores[player] += this.pointsperquestion;
        //console.log(this.scores[player]);
        //console.log(this.scores);
    }

    async playerDone(username) {
        this.finishedGame[username] = true;
        // console.log(this.finishedGame);
    }

    async allPlayersDone() {
        for (const [player, isFinished] of Object.entries(this.finishedGame)) {
            if (!isFinished) {
                return false
            }
        }
        // console.log("all player checks work")
        this.endGame();
        return true
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
            const qNum = this.totalQuestions;
            await db.saveGame(player, gameID, score, rank, qNum);
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

        // https://stackoverflow.com/questions/2647867/how-can-i-determine-if-a-variable-is-undefined-or-null
        if (topic == '')
            this.topic = "General Knowledge";
        else
            this.topic = topic;
        // this.topic = topic || "General Knowledge";

    }

    // from parent class
    async startGame(pointsperquestion, totalQuestions, usernames, topic, duration) {
        this.setSettings(totalQuestions, duration, pointsperquestion)
        this.gameID = 'Classic';


        // topic_array is not an array in this gamemode
        this.setTopic(topic_array);
        // console.log("Topic: " + this.topic);


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

        this.topics = [];
        this.question_array= [];
        this.answered_array= [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
        this.numberAnswered = 0;

    }

    async startGame(pointsperquestion, totalQuestions, usernames, topics, duration) {
        this.setSettings(totalQuestions, duration, pointsperquestion);
        this.gameID = 'Jeopardy';

        // Ensure we have topics, or use defaults
        if (!topics || !Array.isArray(topics) || topics.length === 0) {
            topics = ['History', 'Science', 'Geography', 'Literature', 'Sports'];
        }
        this.setTopics(topics);
        console.log("Topics: " + this.topics);

        if (!Array.isArray(usernames) || usernames.length === 0) {
            throw new Error('Usernames must be a non-empty array.');
        }
        usernames.forEach(name => {
            this.addPlayer(name);
        });
        await this.generateCategories();
    }

    setTopics(topics) {
        this.topics = topics.filter(topic => topic.trim() !== '').slice(0, 6);
        const defaultTopics = ["History", "Science", "Art", "Literature", "Geography", "Sports"];
        let topic_index = 0;
        while (this.topics.length < 6) {
            this.topics.push(defaultTopics[topic_index]); 
            topic_index++;
        }
    }


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

    
                // Referenced GPT documentation to see how to handle inappropriate topics
                if (response.choices[0].message.finish_reason === "content_filter") {
                    return "content_filter";
                }


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

    checkAnswer(player, answer, qindex) {
        if (answer == this.question_array[qindex].correctAnswer) {
            // this.answered_array[qindex] = true;
            // The first person to get the question right gets double points
            if (!this.answered_array[qindex])
                this.increaseScore(player, qindex, true);
            else
                this.increaseScore(player, qindex);

            this.numberAnswered++;
            return true;
        } else if (answer == ""){
            //nothing happens no loss or change in score
        }
        else {
            this.decreaseScore(player, qindex);
            return false;
        }
    }

    increaseScore(player, qindex, firstToAnswer = false) {
        let adjustedIndex = qindex % 5;
        let points = (adjustedIndex + 1) * 200;
        if (firstToAnswer)
            points *= 2;
        this.scores[player] += points;

    }

    decreaseScore(player, qindex) {
        let adjustedIndex = qindex % 5;
        const points = (adjustedIndex + 1) * 200;
        this.scores[player] -= points;
    }

    async getQuestionArray() {
        return this.question_array;
    }

    getNumberAnswered() {
        return this.numberAnswered;
    }

    checkIfAnswered(qindex) {
        if (!this.answered_array[qindex]) {
            this.answered_array[qindex] = true;
            return false;
        }
        else {
            return true;
        }
    }
}



class RandomTrivia extends GameMode {
    constructor(playerCount = 1) {
        super(playerCount);
        this.topics = [];
        this.question_array = [];
        this.answers = [];
    }
   
    setTopic(totalQuestions) {
        const defaultTopics = [
            "History", "Science", "Literature", "Mathematics", "Geography",
            "Art", "Music", "Sports", "Technology", "US Government",
            "Economics", "Biology", "Physics", "Chemistry",
            "Astronomy", "Psychology", "Sociology", "Linguistics",
            "Film", "Television", "Architecture", "Animals",
            "Cuisine", "Law", "Famous Landmarks",
            "Medicine", "Environmental Science", "Computer Science", "Engineering", "Agriculture",
            "Geology", "Meteorology", "Oceanography",
            "Robotics", "Artificial Intelligence",
            "Space Exploration", "Renewable Energy", "Cybersecurity"
        ];

        const topicsCopy = [...defaultTopics];
        this.topics = []
        for (let i = 0; i < totalQuestions; i++) {
            const randomIndex = Math.floor(Math.random() * topicsCopy.length);
            this.topics.push(topicsCopy[randomIndex]);
            topicsCopy.splice(randomIndex, 1);
        }
    }

    // from parent class
    async startGame(pointsperquestion, totalQuestions, usernames, topic_array, duration) {
        this.setSettings(totalQuestions, duration, pointsperquestion)
        this.gameID = 'Random';
        this.setTopic(totalQuestions);
        // console.log("Topics: " + this.topics);
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

    async generateQuestion() {
        try {
            const topicsString = this.topics.join('", "')
            const prompt = `Generate a trivia question on each of the following topics: "${topicsString}" with the topic used in the following JSON format:
        {
            "question": "<trivia question>",  
            "topic": "<topic used>"
        }`;

            const response = await client.chat.completions.create({
                model: "gpt-4o-mini", //most cost effective as of rn
                messages: [
                    { role: "system", content: "You are a trivia game question generator." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 200 * this.totalQuestions,  //may not be neccessary or might adjust
                //response_format: "json_schema"
            });

            //testing
            //console.log('Full OpenAI API Response:', JSON.stringify(response, null, 2));

            // Referenced GPT documentation to see how to handle inappropriate topics
            if (response.choices[0].message.finish_reason === "content_filter") {
                return "content_filter";
            }

            const result = response.choices[0].message.content;

            //testing
            //console.log('FIltered Result:', JSON.stringify(result, null, 2));
            //console.log('Raw API Message:', result);

            //needed to remove non json elements at the start and end (not sure why they are occurring)
            const cleanedone = result.replace(/.*?(\[.*?\])/s, '$1').trim();
            const cleanedResult = cleanedone.replace(/```json|```/g, '').trim();

            //console.log(cleanedResult);
            const parsedQuestions = JSON.parse(cleanedResult);

            //testing
            //console.log('Parsed Question:', parsedQuestions);
            //console.log('Question: ', parsedQuestions[0].question);
            //console.log('Choices: ', parsedQuestions[0].choices);
            //console.log('QA: ', parsedQuestions[0].choices.a);
            //console.log('Answer: ', parsedQuestions[0].correctAnswer);

            this.question_array = parsedQuestions;

            //testing
            //console.log('Question Array:', this.question_array);

        } catch (error) {
            console.error('Error generating question:', error);
        }
    }
    async storeAnswer(username, answer, qindex) {
        if (!this.answers[qindex]) {
            this.answers[qindex] = [];
        }
        this.answers[qindex].push({username, answer});

        //console.log(this.answers);
        //console.log(this.players);
        if (this.answers[qindex].length === this.players.length) {
            //console.log ("player length: ", this.players.length);
            //console.log ("answer length: ", this.answers[qindex].length);
            return await this.checkAnswer(qindex);
        }

    }
    async checkAnswer(qindex) {
        try {
            //testing
            // console.log("index:", qindex)
            // console.log("exact Answer", this.answers[qindex])
            // console.log("exact question: ",this.question_array[qindex].question);
            const question = this.question_array[qindex].question;
            //const exampleAnswer = this.question_array[qindex].exampleAnswer;
            //let prompt = `Question: "${question}"\nExample Answer: "${exampleAnswer}"\n\nPlayer Answers:\n`;
            let prompt = `Question: "${question}"\nPlayer Answers:\n`;
            
            /*    Object.entries(playerAnswers).forEach(([player, answer]) => {
                prompt += `${player}: ${answer}\n`;
                });*/
            this.answers[qindex].forEach(({username, answer}) => {
                prompt += `- ${username}: ${answer}\n`;
            })
            
            prompt += "\nEvaluate each player's answer and respond with a JSON object where keys are player names and values are boolean (true for correct, false for incorrect). Consider alternative phrasings and partial correctness. Only return the JSON object, no additional text.";

            //console.log(prompt);
            const response = await client.chat.completions.create({
                model: "gpt-4o-mini", //most cost effective as of rn
                messages: [
                    { role: "system", content: "You are an AI assistant that evaluates trivia answers." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 150,
                //response_format: "json_schema"
            });
            const result = response.choices[0].message.content;
            const cleanedone = result.replace(/.*?(\[.*?\])/s, '$1').trim();
            const cleanedResult = cleanedone.replace(/```json|```/g, '').trim();
            const parsedAnswers = JSON.parse(cleanedResult);
            //console.log(parsedAnswers);

            Object.entries(parsedAnswers).forEach(([player, bool]) => {
                if (bool === true) {
                    this.generateScores(player);
                    //console.log("worked")
                } else if (bool === false) {
                    //console.log("also worked");
                } else {
                    //console.log("did not work");
                }
                
            });
            // console.log(this.scores);

            //for testing only and may not use in code
            return parsedAnswers;


        } catch (error) {
            console.error('Error checking answers:', error);
            return {};
          }
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
    async getQuestion(question_array) {
        return this.question_array[this.currentQuestion].question;
    }
    async incrementQuestion(question_array) {
        this.currentQuestion = this.currentQuestion + 1;
    }
    getCurrentTopic() {
        return this.topics[this.currentQuestion];
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



module.exports = { GameMode, ClassicTrivia, TriviaBoard, RandomTrivia };