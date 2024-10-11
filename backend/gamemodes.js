//const {OpenAI}  = require('openai');
//const client = new OpenAI();
//some code taken from openai.com

require('dotenv').config();
const OpenAI = require('openai');
const client = new OpenAI({apiKey: process.env['OPENAI_API_KEY']});


class GameMode {
    constructor(playerCount = 1) {
        this.players = [];
        this.totalQuestions = 0;
        this.currentRound = 0;
        this.timePerQuestion = 0;
        this.currentQuestion = null;
        this.scores = {};
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
    endGame() {
        let winner = Object.keys(this.scores).reduce((a, b) => this.scores[a] > this.scores[b] ? a : b);
        console.log(`Game Over! Winner is ${winner} with ${this.scores[winner]} points!`);
    }
}



class ClassicTrivia extends GameMode {
    constructor(playerCount = 1) {
        super(playerCount);
        this.topic = '';
        this.correctAnswer = null;
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
            const prompt = `Generate a trivia question on the topic of "${this.topic}" with four multiple-choice answers in the following JSON format:
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
                max_tokens: 200,  //may not be neccessary or might adjust
                //response_format: "json_schema"
            });
            
            //testing
            //console.log('Full OpenAI API Response:', JSON.stringify(response, null, 2));
    
            const result = response.choices[0].message.content;

            //testing
            //console.log('FIltered Result:', JSON.stringify(result, null, 2));
            //console.log('Raw API Message:', result);

            //use helper function
            //const parsedQuestion = this.parseTriviaResponse(result);

            //testing
            //console.log('Parsed Question:', parsedQuestion);

            //this.correctAnswer = parsedQuestion.correctAnswer;
            
            const parsedQuestion = JSON.parse(result);
            this.correctAnswer = parsedQuestion.correctAnswer

            //testing
            console.log('Parsed Question:', parsedQuestion);
            console.log('Question: ', parsedQuestion.question);
            console.log('Choices: ', parsedQuestion.choices);
            console.log('Answer: ', this.correctAnswer);

            return parsedQuestion;
        } catch (error) {
            console.error('Error generating question:', error);
        }
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