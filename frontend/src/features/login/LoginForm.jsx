import { Button, Card, Container, Col, Form, Row } from 'react-bootstrap'

function LoginForm() {
  return (
    <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className='p-3'>
            <Card.Title>Login</Card.Title>
            <Form> 
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter email" />
                <Form.Text className="text-muted">
                  We'll never share your email with anyone else.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicCheckbox">
                <Form.Check type="checkbox" label="Check me out" />
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

export default LoginForm;