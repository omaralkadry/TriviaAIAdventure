import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useSocket } from '../../../services/SocketContext';
import Play from '../Play';

const Question = ({ selectedQuestion, duration, handleNextQuestion }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const socket = useSocket();
  const [buzzed, setBuzzed] = useState(false);
  const [isCountdownFinished, setIsCountdownFinished] = useState(false);
  const [key, setKey] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);

  // Handle session persistence and reconnection
  useEffect(() => {
    if (socket) {
      // Store game state in localStorage
      const gameState = {
        question: selectedQuestion,
        buzzed,
        submitted,
        answer: selectedAnswer
      };
      localStorage.setItem('jeopardyGameState', JSON.stringify(gameState));

      // Handle reconnection
      socket.on('connect', () => {
        const savedState = localStorage.getItem('jeopardyGameState');
        if (savedState) {
          const state = JSON.parse(savedState);
          socket.emit('rejoin_game', state);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Disconnected from game session - attempting reconnection');
        socket.connect();
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
      };
    } else {
      console.warn('Jeopardy Question: Socket is not initialized');
    }
  }, [socket, selectedQuestion, buzzed, submitted, selectedAnswer]);

  const handleBuzzer = () => {
    // Handle clicking buzzer with socket.io
    // Buzzed contestant gets to answer question
    socket.emit('buzzer pressed');
    setBuzzed(true);
  };

  const handleAnswerSubmit = () => {
    // Handle submiting answer
    if (!submitted) {
      socket.emit('submit answer', null, null, selectedAnswer, null);
      setSubmitted(true);
    }
  };

  const handleCountdownFinish = useCallback(() => {
    setIsCountdownFinished(true);
  }, []);

  return (
    <>
      <Play
        timePerQuestion= {duration}
        currentQuestion={selectedQuestion}
        selectedAnswer={selectedAnswer}
        setSelectedAnswer={setSelectedAnswer}
        isCountdownFinished={isCountdownFinished}
        handleAnswerSubmit={handleAnswerSubmit}
        handleCountdownFinish={handleCountdownFinish}
        handleNextQuestion={handleNextQuestion}
        key={key}
        buzzed={buzzed}
      />

      <Container fluid className="mt-5">
        <Row className="justify-content-center">
          <Col md={4} className="text-center">
            {!buzzed && !isCountdownFinished && (
              <Button
                onClick={() => handleBuzzer()}
                className="btn-lg px-5 py-3"
                style={{
                  background: 'var(--primary-gradient)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '15px',
                  color: 'var(--text-light)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)'
                }}
              >
                Buzz In
              </Button>
            )}
            {!submitted && buzzed && !isCountdownFinished && (
              <Button
                onClick={() => handleAnswerSubmit()}
                className="btn-lg px-5 py-3"
                style={{
                  background: 'var(--primary-gradient)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '15px',
                  color: 'var(--text-light)',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)'
                }}
              >
                Submit Answer
              </Button>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Question;
