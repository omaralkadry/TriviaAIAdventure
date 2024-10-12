import React, { useState } from 'react';
import { Card, Container, Row, Col, ToggleButton } from 'react-bootstrap';
import Timer from './Timer';

function Play() {
  const question = "What is the chemical symbol for gold?";
  const answers = ['Ag', 'Au', 'Hg', 'Pb'];
  const correct = 1;
  const duration = { seconds: 5 };

  const [isCountdownFinished, setIsCountdownFinished] = useState(false);
  const [clickedChoice, setClickedChoice] = useState(-1);

  const handleCountdownFinish = () => {
    setIsCountdownFinished(true);
  };
  
  return (
    <>
      <Container fluid className="justify-content-center mt-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8} xl={6} xxl={4}>
            <Card>
              <Card.Body 
                className="text-center d-flex justify-content-center align-items-center" 
                style={{ height: '200px', padding: '20px' }}
              >
                {question}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Container className="mt-5">
        <Row xs={1} md={2} className="g-4 mb-3">
          {answers.map((answer, idx) => (
            <Col key={idx}>
              <Card className="shadow-sm border-white">
                <ToggleButton 
                  variant={isCountdownFinished ? (idx === correct ? "success" : (idx === clickedChoice ? "outline-danger" : "outline-dark")) : "outline-dark"}
                  size="lg" 
                  block id={`button-${idx + 1}`} 
                  onClick={() => setClickedChoice(idx)}
                  disabled={isCountdownFinished}
                >
                  {answer}
                </ToggleButton>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
      <Timer onCountdownFinish={handleCountdownFinish} duration={duration}/>
    </>
  );
}
export default Play;