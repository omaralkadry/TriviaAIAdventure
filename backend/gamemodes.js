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
        this.topic = topic || "General Knowledge";
    }

    // from parent class
    async startGame(pointsperquestion, totalQuestions, usernames, topic_array, duration) {
        this.setSettings(totalQuestions, duration, pointsperquestion)
        this.gameID = 'Classic';
        this.setTopic(topic_array[0]);
        console.log(topic_array[0]);
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
            const prompt = `Generate ${this.totalQuestions} trivia questions on the topic of "${this.topic}" with four multiple-choice answers in the following JSON format:
        {
            "question": "<trivia question>",
            "choices": {
                "a": "<option 1>",
                "b": "<option 2>",
                "c": "<option 3>",
                "d": "<option 4>"
            },
            "correctAnswer": "<correct answer letter>"
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

}

class TriviaBoard extends GameMode {
    constructor(playerCount = 1) {
        super(playerCount);
        this.topics = [];
        this.question_array= [];
        this.answered_array= [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
        this.numberAnswered = 0;
    }

    async startGame(pointsperquestion, totalQuestions, usernames, topics, duration) {
        this.setSettings(totalQuestions, duration, pointsperquestion);
        this.gameID = 'TriviaBoard';
        this.setTopics(topics);

        if (!Array.isArray(usernames) || usernames.length === 0) {
            throw new Error('Usernames must be a non-empty array.');
        }

        usernames.forEach(name => {
            this.addPlayer(name);
        });

        //await this.generateQuestion();
    }

    setTopics(topics) {
        this.topics = topics.filter(topic => topic.trim() !== '').slice(0, 6);
        const defaultTopics = ["History", "Science", "Art", "Literature", "Geography", "Sports"];
        let topic_index = 0;
        while (this.topics.length < 6) {
            this.topics.push(defaultTopics[topic_index]); 
            topic_index++;
        }
        console.log(this.topics);
    }

    async generateQuestion() {

        try {
            for (let i = 0; i < this.topics.length; i++) {
                const topic = this.topics[i];
    
                const prompt = `Generate 5 trivia questions where the first question is easy and each following question is increasingly difficult. Make them on the topic of "${topic}" with four multiple-choice answers in the following JSON format:
                {
                    "question": "<trivia question>",
                    "choices": {
                        "a": "<option 1>",
                        "b": "<option 2>",
                        "c": "<option 3>",
                        "d": "<option 4>"
                    },
                    "correctAnswer": "<correct answer letter>"
                }`;
    
                const response = await client.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "You are a trivia game question generator." },
                        { role: "user", content: prompt }
                    ],
                    max_tokens: 200 * 5, // 5 questions per topic
                });
    
                // Referenced GPT documentation to see how to handle inappropriate topics
                if (response.choices[0].message.finish_reason === "content_filter") {
                    return "content_filter";
                }

                const result = response.choices[0].message.content;

                const cleanedone = result.replace(/.*?(\[.*?\])/s, '$1').trim();
                const cleanedResult = cleanedone.replace(/```json|```/g, '').trim();
                const parsedQuestions = JSON.parse(cleanedResult);
    
                // Append parsed questions with point value to question array
                this.question_array.push(...parsedQuestions.map(question => ({
                    ...question
                })));
            }
    
            //console.log('Generated Questions:', this.question_array);
    
        } catch (error) {
            console.error('Error generating questions:', error);
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
    }
   
    setTopic(totalQuestions) {
        const defaultTopics = [
            "History", "Science", "Literature", "Mathematics", "Geography",
            "Art", "Music", "Sports", "Technology", "Philosophy",
            "Politics", "Economics", "Biology", "Physics", "Chemistry",
            "Astronomy", "Psychology", "Sociology", "Anthropology", "Linguistics",
            "Film", "Television", "Theater", "Dance", "Architecture",
            "Cuisine", "Fashion", "Mythology", "Religion", "Law",
            "Medicine", "Environmental Science", "Computer Science", "Engineering", "Agriculture",
            "Archaeology", "Geology", "Meteorology", "Oceanography", "Genetics",
            "Cryptography", "Robotics", "Artificial Intelligence", "Quantum Physics", "Nanotechnology",
            "Space Exploration", "Renewable Energy", "Cybersecurity", "Biotechnology", "Neuroscience"
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
        console.log(this.topics);
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

    //TODO
    /*
    async checkAnswer(player, answers, qindex) {
        try {
            let prompt = `Question: "${question}"\n\nAnswers:\n`;
        answers.forEach((answer, index) => {
            prompt += `${playerNames[index]}: ${answer}\n`;
        });
        prompt += "\nEvaluate each answer and respond with a JSON array of boolean values (true for correct, false for incorrect) in the same order as the answers provided. Only return the JSON array, no additional text.";


            const response = await client.chat.completions.create({
                model: "gpt-4o-mini", //most cost effective as of rn
                messages: [
                    { role: "system", content: "You are an AI assistant that evaluates trivia answers." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 200 * this.totalQuestions,  //may not be neccessary or might adjust
                //response_format: "json_schema"
            });
            const result = response.choices[0].message.content;
            const cleanedone = result.replace(/.*?(\[.*?\])/s, '$1').trim();
            const cleanedResult = cleanedone.replace(/```json|```/g, '').trim();
            const parsedAnswers = JSON.parse(cleanedResult);

            for (let answerIndex = 0; answerIndex < answers.length; answerIndex++) {
                if (answers[answerIndex] === true) {
                    this.generateScores(player[answerIndex]);
                }
            }


        } catch (error) {
            console.error('Error checking question answers:', error);
        }
    }
    */

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

    async checkAnswer(playerAnswers, qindex) {
        try {
            const question = this.question_array[qindex].question;
            //const exampleAnswer = this.question_array[qindex].exampleAnswer;
            //let prompt = `Question: "${question}"\nExample Answer: "${exampleAnswer}"\n\nPlayer Answers:\n`;
            let prompt = `Question: "${question}"\nPlayer Answers:\n`;
            
            Object.entries(playerAnswers).forEach(([player, answer]) => {
              prompt += `${player}: ${answer}\n`;
            });
            
            prompt += "\nEvaluate each player's answer and respond with a JSON object where keys are player names and values are boolean (true for correct, false for incorrect). Consider alternative phrasings and partial correctness. Only return the JSON object, no additional text.";

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

            Object.entries(parsedAnswers).forEach(([player, isCorrect]) => {
                if (isCorrect) {
                    this.generateScores(player);
                }
            });

            //for testing only and may not use in code
            return parsedAnswers;


        } catch (error) {
            console.error('Error checking answers:', error);
            return {};
          }
    }

    async getQuestionArray() {
        return this.question_array;
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

}



module.exports = { GameMode, ClassicTrivia, TriviaBoard, RandomTrivia };
