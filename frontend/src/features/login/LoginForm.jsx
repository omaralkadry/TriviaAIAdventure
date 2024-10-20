// Referenced https://www.geeksforgeeks.org/javascript-fetch-method/
// Referenced https://www.w3schools.com/html/html_form_input_types.asp
import { useState } from 'react';
import { Button, Card, Container, Col, Form, Row } from 'react-bootstrap'
import { useAuth } from '../../services/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  // const [loginSuccessful, setLoginSuccessful] = useState();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Handle login logic here
    // onLogin({ username, password });

    // Referenced https://www.geeksforgeeks.org/javascript-fetch-method/
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username: username, password: password})
    };

    // Status Code 200 (Status Ok) means login was successful
    fetch("http://localhost:3000/login", options)
      .then(response => {
        if (response.ok) {
          // Login was successful
          // setLoginSuccessful(true);
          console.log("Login Successful");

          // Saves response user data into AuthContext
          response.json().then(data => {
            login(data);
          });

          // Redirect to stored path or home
          const redirectPath = localStorage.getItem('redirectPath');
          navigate(redirectPath || '/');

          // Clear stored path for next use
          localStorage.removeItem('redirectPath');
        }
        else {
          // Login was not successful
          // setLoginSuccessful(false);
          console.log("Login Unsuccessful");
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
            <Card.Title>Login</Card.Title>

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