import React from 'react';
import { Container, Row, Col, Card, ToggleButton } from 'react-bootstrap';
import Timer from './Timer.jsx';

const Play = ({ currentQuestion, selectedAnswer, setSelectedAnswer, isCountdownFinished, handleAnswerSubmit, handleCountdownFinish, key }) => {
  return (
      <Container>
        <Container fluid className="justify-content-center mt-5">
          <Row className="justify-content-center">
            <Col md={10} lg={8} xl={6} xxl={4}>
              <Card className="question-card">
                <Card.Body
                    className="text-center d-flex justify-content-center align-items-center question-body"
                    style={{ height: '200px', padding: '20px' }}
                >
                  {currentQuestion.question}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
        <Container className="mt-5">
          {Array.isArray(currentQuestion.answers) && (
              <Row xs={1} md={2} className="g-4 mb-3">
                {currentQuestion.answers.map((answer, idx) => (
                    <Col key={idx}>
                      <Card className="shadow-sm border-white answer-card">
                        <ToggleButton
                            variant={isCountdownFinished ? (idx === currentQuestion.answer ? "success" : (idx === selectedAnswer ? "outline-danger" : "outline-dark")) : "outline-dark"}
                            size="lg"
                            block id={`button-${idx + 1}`}
                            onClick={() => setSelectedAnswer(idx)}
                        >
                          {answer}
                        </ToggleButton>
                      </Card>
                    </Col>
                ))}
              </Row>
          )}
          {isCountdownFinished && (
              <Row className="justify-content-center mt-3">
                <Col xs="auto">
                  <button className="next-button" onClick={handleAnswerSubmit}>Submit Answer</button>
                </Col>
              </Row>
          )}
        </Container>
        <Timer key={key} onCountdownFinish={handleCountdownFinish} duration={currentQuestion.duration || 30}/>
      </Container>
  );
};


export default Play;