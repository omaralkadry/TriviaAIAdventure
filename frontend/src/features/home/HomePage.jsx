import { Button, Card, Container, Col, Row, ListGroup } from 'react-bootstrap';

function HomePage() {
  return (
    <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="justify-content-center">
        <Col md={12}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Trivia AI Adventure</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Button href='/room'>Create Room</Button>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Button href='/join'>Join Room</Button>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;
