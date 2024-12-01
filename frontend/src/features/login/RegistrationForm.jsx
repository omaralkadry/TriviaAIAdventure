import React, { useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Container, Col, Row } from 'react-bootstrap';
import './Form.css';

function RegistrationForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    };

    fetch(`${import.meta.env.VITE_BASE_URL}/register`, options)
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              login(data);
              const redirectPath = localStorage.getItem('redirectPath');
              navigate(redirectPath || '/');
              localStorage.removeItem('redirectPath');
            });
          } else {
            response.text().then(errorMessage => {
              console.log("Registration Unsuccessful:", errorMessage);
              setError(errorMessage);
            });
          }
        })
        .catch(err => {
          console.error("Registration error:", err);
          setError("Failed to connect to the server. Please try again.");
        });
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center form-page-container">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="form-card">
            <Card.Title className="form-title">Register</Card.Title>
            {error && <div className="alert alert-danger">{error}</div>}
            <form className="form-container" onSubmit={handleSubmit}>
              <div className="form-control">
                <input
                    type="text"
                    id="username"
                    placeholder=" "
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <label htmlFor="username">Username</label>
              </div>
              <div className="form-control">
                <input
                    type="password"
                    id="password"
                    placeholder=" "
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <label htmlFor="password">Password</label>
              </div>
              <div className="form-control">
                <input
                    type="password"
                    id="confirmPassword"
                    placeholder=" "
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
              </div>
              {password !== confirmPassword && confirmPassword !== "" && (
                  <p className="error-text">Passwords do not match</p>
              )}
              <button type="submit" className="btn">
                Register
              </button>
              <div className="form-footer">
                <p>
                  Already have an account?{" "}
                  <Link to="/login" className="form-link">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RegistrationForm;
