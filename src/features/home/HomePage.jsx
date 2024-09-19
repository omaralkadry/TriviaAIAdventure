import { Button, Card, Container, Col, Row } from 'react-bootstrap';

function HomePage() {
  return (
    <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Row> 
        <Col> 
          <h1>Trivia</h1>
          <Card>
            <Button>Play Game</Button>
          </Card>
        </Col>
      </Row>
    </Container>

  );
}

export default HomePage;
