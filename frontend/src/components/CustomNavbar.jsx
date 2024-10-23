import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { useAuth } from '../services/AuthContext';
import React from 'react';

function CustomNavbar() {
  const { isAuthenticated, getUsername, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Optionally, you can add navigation logic here if needed
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
          </Nav>
          <Navbar.Collapse className="justify-content-end">
            {
              isAuthenticated() ?
                <Navbar.Text>
                  Signed in as:
                  <NavDropdown title={getUsername()}>
                    <Nav.Link onClick={handleLogout} href="/">Logout</Nav.Link>
                  </NavDropdown>
                </Navbar.Text>
                :
                <Navbar.Text>
                  <NavDropdown title='Account'>
                    <Nav.Link href="/login">Login</Nav.Link>
                    <Nav.Link href="/register">Register</Nav.Link>
                  </NavDropdown>
                </Navbar.Text>
            }
          </Navbar.Collapse>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
