import { useState } from 'react';
import { Button, Card, Container, Col, Form, Row } from 'react-bootstrap'

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Handle login logic here
    onLogin({ email, password });
  };

  return (
    <Container 
      fluid 
      className="d-flex justify-content-center align-items-center" 
      style={{ height: '100vh' }}
    >
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className='p-3'>
            <Card.Title>Login</Card.Title>
            <Form onSubmit={handleSubmit}> 
              <Form.Group 
                className="mb-3" 
                controlId="formBasicEmail"
              >
                <Form.Label>Email</Form.Label>
                <Form.Control 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                />
              </Form.Group>

              <Form.Group 
                className="mb-3"
                controlId="formBasicPassword"
              >
                <Form.Label>Password</Form.Label>
                <Form.Control 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button 
                variant="primary" 
                type="submit" 
              >
                Enter
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginForm;