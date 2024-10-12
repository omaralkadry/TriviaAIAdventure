//const {OpenAI}  = require('openai');
//const client = new OpenAI();
//some code taken from openai.com

require('dotenv').config();
const OpenAI = require('openai');
const client = new OpenAI({apiKey: process.env['OPENAI_API_KEY']});


class GameMode {
    constructor(playerCount = 1) {
        this.players = [];
        this.totalQuestions = 5;
        this.currentRound = 0;
        this.timePerQuestion = 0;
        this.currentQuestion = 0;
        this.scores = {};
        this.ranks = {};
    }

    addPlayer(player) {
        this.players.push(player);
        this.scores[player] = 0; 
    }

    setSettings(totalQuestions, timePerQuestion) {
        this.totalQuestions = totalQuestions;
        this.timePerQuestion = timePerQuestion;
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

    //function created with chatgpt
    //not tested
    async endGame() {
        let winner = Object.keys(this.scores).reduce((a, b) => this.scores[a] > this.scores[b] ? a : b);
        console.log(`Game Over! Winner is ${winner} with ${this.scores[winner]} points!`);
        const uri = process.env.Database_Url;
        const db = new Database(uri);

        await Promise.all(this.players.map(async (player) => {
            const score = this.scores[player];
            const rank = this.ranks[player];
            await db.saveGame(player, gameID, score, rank);
        }));
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
    async startGame() {
        console.log(`Starting Classic Trivia on topic: ${this.topic}`);
        for (let round = 1; round <= this.totalQuestions; round++) {
            this.currentRound = round;
            this.currentQuestion = await this.generateQuestion();

            console.log(`Round ${round}: ${this.currentQuestion.question}`);
            this.currentQuestion.choices.forEach(choice => {
                console.log(`${choice.letter}) ${choice.choice}`);
            });

            //TODO insert timer functionality

            //TODO player answer needs to be input from the frontend
            for (let player of this.players) {
                let answer = await this.getPlayerAnswer(player); 
        
                if (this.checkAnswer(answer)) {
                    this.scores[player] = (this.scores[player] || 0) + this.calculatePoints();
                    console.log(`${player} answered correctly!`);
                } else {
                    console.log(`${player} answered incorrectly.`);
                }
            }
            //this.checkAnswer(player, answer);
        }
        this.endGame();
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
    
            const result = response.choices[0].message.content;

            //testing
            //console.log('FIltered Result:', JSON.stringify(result, null, 2));
            //console.log('Raw API Message:', result);

            //needed to remove non json elements at the start and end (not sure why they are occurring)
            const cleanedone = result.replace(/.*?(\[.*?\])/s, '$1').trim();
            const cleanedResult = cleanedone.replace(/```json|```/g, '').trim();
            
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

    //TODO needs adjustment
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

    checkAnswer(player, answer) {

        return answer === this.correctAnswer;
        /*
        if (true) { //add check methodology
            this.scores[player] += 10;
            console.log(`${player} answered correctly! Current score: ${this.scores[player]}`);
        } else {
            console.log(`${player} answered incorrectly.`);
        }
        */
    }
}

module.exports = { GameMode, ClassicTrivia };