javascript
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { useAuth } from '../services/AuthContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function CustomNavbar() {
  const { isAuthenticated, getUsername, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault(); // Prevent default navigation
    try {
      await logout();
      // Navigation is handled in AuthContext after successful logout
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally show error message to user
    }
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">Brand</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/play">Play Test</Nav.Link>
            <Nav.Link href="/chat">Chat</Nav.Link>
            <Nav.Link href="/leaderboard">Leaderboard</Nav.Link>
            <Nav.Link href="/jeopardy">Jeopardy</Nav.Link>
          </Nav>
          <Nav>
            {isAuthenticated() ? (
              <>
                <Navbar.Text className="me-2">
                  Signed in as:
                </Navbar.Text>
                <NavDropdown
                  title={getUsername()}
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <NavDropdown
                title="Account"
                id="account-dropdown"
                align="end"
              >
                <NavDropdown.Item href="/login">
                  Login
                </NavDropdown.Item>
                <NavDropdown.Item href="/register">
                  Register
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
