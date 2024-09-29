import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

function Timer({ duration, onCountdownFinish }) {
  const [countdown, setCountdown] = useState(duration);
  const [start, setStart] = useState(true);

  useEffect(() => {
    if (start) {
      let interval = setInterval(() => {
        const newCountdown = { ...countdown };
        if (newCountdown.seconds > 0) {
          newCountdown.seconds -= 1;
        } else {
          clearInterval(interval);
          onCountdownFinish();
        }
        setCountdown(newCountdown);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [start, countdown, onCountdownFinish]);

  return (
    <Container fluid className='mt-5'>
      <Row className="justify-content-center">
        <Col md={1}>
          <Card>
            <Card.Body>
              <Card.Text className="text-center">
                {countdown.seconds}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Timer;
