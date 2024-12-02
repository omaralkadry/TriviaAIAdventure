import React, { useEffect } from 'react';
import { Container, Row, Col, Card, ToggleButton } from 'react-bootstrap';
import Timer from './Timer.jsx';

const Play = ({ timePerQuestion, currentQuestion, selectedAnswer, setSelectedAnswer, isCountdownFinished, handleAnswerSubmit, handleCountdownFinish, handleNextQuestion, freeResponse = false, key, buzzed = true}) => {

  useEffect(() => {
    if (isCountdownFinished) {
      handleAnswerSubmit();
    }
  }, [isCountdownFinished, handleAnswerSubmit]);

  if (!currentQuestion) {
    return (
      <Container>
        <Row className="justify-content-center mt-5">
          <Col>
            <h2>Loading question...</h2>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
      <Container>
        <Container fluid className="justify-content-center mt-5">
          <Row className="justify-content-center">
            <Col md={10}>
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
          { (buzzed || isCountdownFinished) && Array.isArray(currentQuestion.answers) && !freeResponse && (
              <Row xs={1} md={2} className="g-4 mb-3">
                {currentQuestion.answers.map((answer, idx) => (
                    <Col key={idx}>
                      <Card className="shadow-sm border-white answer-card">
                        <ToggleButton
                            variant={isCountdownFinished ? (idx === currentQuestion.answer ? "success" : (idx === selectedAnswer ? "outline-danger" : "outline-dark")) : "outline-dark"}
                            size="lg"
                            block id={`button-${idx + 1}`}
                            onClick={() => setSelectedAnswer(idx)}
                            disabled={isCountdownFinished}
                            style={ isCountdownFinished ? { opacity: 1 } : {} } 
                        >
                          {answer}
                        </ToggleButton>
                      </Card>
                    </Col>
                ))}
              </Row>
          )}
          {/* Render text input when freeResponse prop is true */}
          {freeResponse && (
                    <Row className="justify-content-center mb-3">
                        <Col md={8}>
                            <input 
                                type="text" 
                                className="input-field" 
                                value={selectedAnswer || ''} // Bind input value to selectedAnswer
                                onChange={(e) => setSelectedAnswer(e.target.value)} // Update selectedAnswer on change
                                placeholder="Type your answer here"
                                disabled={isCountdownFinished} // Disable if countdown finished
                            />
                        </Col>
                    </Row>
          )}
          {/* {!isCountdownFinished && (
              <Row className="justify-content-center mt-3">
                <Col xs="auto">
                  <button className="next-button" onClick={handleAnswerSubmit}>Submit Answer</button>
                </Col>
              </Row>
          )} */}
          {isCountdownFinished && (
              <Row className="justify-content-center mt-3">
                <Col xs="auto">
                  <button className="next-button" onClick={handleNextQuestion}>Next Question</button>
                </Col>
              </Row>
          )}
        </Container>
        {/* TODO: Adjust Default timer variable here */}
        <Timer key={key} onCountdownFinish={handleCountdownFinish} duration={timePerQuestion || 15}/>
      </Container>
  );
};


export default Play;
