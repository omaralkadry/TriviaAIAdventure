import React, { useState } from 'react';
import { Button, Card, Container, Col, Form, Row } from 'react-bootstrap'
import { useAuth } from '../../services/AuthContext';
import { useNavigate } from 'react-router-dom';

function RegistrationForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Handle registration logic here
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username, password: password })
    };

    // Fetch API POST request for registration
    fetch("http://localhost:3000/register", options)
      .then(response => {
        if (response.ok) {
          console.log("Registration Successful");

          // Saves response user data into AuthContext
          response.json().then(data => {
            login(data);
          });

          // Redirect to stored path or home
          const redirectPath = localStorage.getItem('redirectPath');
          navigate(redirectPath || '/');

          // Clear stored path for next use
          localStorage.removeItem('redirectPath');
        } else {
          console.log("Registration Unsuccessful");
        }
      })
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
            <Card.Title>Register</Card.Title>
            <Form onSubmit={handleSubmit}> 
              <Form.Group 
                className="mb-3" 
                controlId="formBasicUsername"
              >
                <Form.Label>Username</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
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
                <Form.Control
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>
              {password !== confirmPassword && confirmPassword !== "" && (
                <Form.Text className="text-danger">
                  Passwords do not match
                </Form.Text>
              )}
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

export default RegistrationForm;
