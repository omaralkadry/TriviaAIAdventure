import { Button, Card, Container, Col, Form, Row } from 'react-bootstrap'

function JoinPage() {
  return (
    <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className='p-3'>
            <Form> 
              <Form.Group className="mb-3">
                <Form.Label>Enter room code.</Form.Label>
                <Form.Control placeholder="code" />
              </Form.Group>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default JoinPage;