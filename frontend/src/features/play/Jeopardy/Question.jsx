import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';

const Question = ({ selectedQuestion }) => {
  const [answer, setAnswer] = useState('');

  const handleBuzz = () => {
    // Handle clicking buzz with socket.io
    // Answering contestant gets to answer question
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
            <Button>Buzz</Button>
            <Form.Control
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={`Enter your answer here.`}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Question;
