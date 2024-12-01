import React from 'react';
import { Container, Accordion } from 'react-bootstrap';
import './faq.css';

const FAQ = () => {
    return (
        <Container className="faq-container">
            <h1 className="faq-title">How to Play</h1>
            
            <Accordion className="faq-accordion">
                <Accordion.Item eventKey="0" className="faq-item">
                    <Accordion.Header>Classic Trivia Mode</Accordion.Header>
                    <Accordion.Body>
                        <h3>Overview</h3>
                        <p>Regular Trivia based on one topic</p>
                        
                        <h3>How to Play</h3>
                        <ul>
                            <li>Choose all your settings: Timer length, Topic, number of questions or use our defaults </li>
                            <li>Add your friends with the provided room code</li>
                            <li>Select your answer withing the time limit, you can change your answer as many times as you want. Last selected answer when timer runs out is submitted</li>
                        </ul>
                        
                        <h3>Scoring</h3>
                        <p>You each get 10 points for each correct answer. No points deducted for wrong answers. If you don't know try to guess.</p>
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1" className="faq-item">
                    <Accordion.Header>Trivia Board Mode</Accordion.Header>
                    <Accordion.Body>
                        <h3>Overview</h3>
                        <p>Our version of a Jeopardy game. Everyone gets to answer but the first person to buzz can win or lose more points than the rest.</p>
                        
                        <h3>How to Play</h3>
                        <ul>
                            <li>Choose all your settings: Timer length, Topics or use our defaults </li>
                            <li>Add your friends with the provided room code</li>
                            <li>Select from different categories</li>
                            <li>Questions have varying point values as shown on the board</li>
                            <li>The host will choose the first question. Whoever answers first correctly will choose the next question</li>
                            <li>If you are confident in your answer make sure to buzz in and submit quickly. Refer to scoring below for why.</li>
                            <li>If you buzzed in make sure to answer. Otherwise you will guarantee a wrong answer. Feel free to abstain from hard questions to avoid losing points by not buzzing in.</li>
                        </ul>
                        
                        <h3>Scoring</h3>
                        <p>Points are calculated based on the point value of the selected board piece. In this mode wrong answers deduct points as well. 
                        If you don't know the answer, don't buzz in. The first player to buzz in and answer will receive twice the amount of points or lose twice the amount.</p>
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="2" className="faq-item">
                    <Accordion.Header>Random Trivia Mode</Accordion.Header>
                    <Accordion.Body>
                        <h3>Overview</h3>
                        <p>Randomly chosen topics by us. Along with a free response answer format where your answers are graded by the OPENAI engine.</p>
                        
                        <h3>How to Play</h3>
                        <ul>
                            <li>Choose all your settings: Timer length, number of questions or use our defaults </li>
                            <li>Add your friends with the provided room code</li>
                            <li>Questions are from random categories. Each question will have a different Topic.</li>
                            <li>Free-form answer format. Type in your answer in the provided box. Once the timer ends your answer will be submitted.</li>
                        </ul>
                        
                        <h3>Scoring</h3>
                        <p>You each get 10 points for each correct answer. No points deducted for wrong answers. If you don't know try to guess. Maybe the OPENAI engine will be lenient.</p>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </Container>
    );
};

export default FAQ;