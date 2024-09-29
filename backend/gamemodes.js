

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
            this.checkAnswer(player, answer);
        }
        this.endGame();
    }

    async generateQuestion() {
        // TODO Integrate chatgpt connection
    }

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

        //use gpt to check if answer is correct

        if (true) { //add check methodology
            this.scores[player] += 10;
            console.log(`${player} answered correctly! Current score: ${this.scores[player]}`);
        } else {
            console.log(`${player} answered incorrectly.`);
        }
    }
}

module.exports = { GameMode, ClassicTrivia };