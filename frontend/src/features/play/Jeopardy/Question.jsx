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

  // Handler on who gets to answer
  useEffect(() => {
    if (socket) {

      return () => {

      };
    } else {
      console.warn('Jeopardy Question: Socket is not initialized');
    }
  }, [socket]);

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

      <Container fluid className="justify-content-center mt-5">
        <Row className="justify-content-center">
          <Col md={4}>
            { !buzzed && !isCountdownFinished && (
              <Button onClick={() => handleBuzzer()}>Buzz</Button>
            )}
            { !submitted && buzzed && !isCountdownFinished && (
              <Button onClick={() => handleAnswerSubmit()}>Submit</Button>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Question;
