import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { useSocket } from '../../../services/SocketContext';
import { useAuth } from '../../../services/AuthContext';

const Question = ({ selectedQuestion }) => {
  const [answer, setAnswer] = useState('');
  const socket = useSocket();
  const { getUsername } = useAuth();
  const [buzzed, setBuzzed] = useState(false);
  const username = getUsername();

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

  const handleSubmit = () => {
    // Handle submiting answer
  };
  
  return (
    <>
      <Container fluid className="justify-content-center mt-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8} xl={6} xxl={4}>
            <Card className="question-card">
              <Card.Body
                className="text-center d-flex justify-content-center align-items-center question-body"
                style={{ height: '200px', padding: '20px' }}
              >
                {selectedQuestion.question}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md={4}>
            <Button onClick={() => handleBuzzer()}>Buzz</Button>
            { buzzed && (
              <Form.Control
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={`Enter your answer here.`}
              />
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Question;
