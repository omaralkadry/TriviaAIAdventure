import React, { useState } from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import './NavbarStyles.css';

const CustomNavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar expand="lg" className="navbar-custom">
      <Container>
        <Navbar.Brand href="/">Trivia AI</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/play">Play Test</Nav.Link>
            <Nav.Link href="/chat">Chat</Nav.Link>
            <Nav.Link href="/leaderboard">Leaderboard</Nav.Link>
            <Nav.Link href="/jeopardy">Jeopardy</Nav.Link>
            <Nav.Link href="/history">Game History</Nav.Link>
          </Nav>
          <Navbar.Text>
            {user ? (
              <div className="navbar-dropdown">
                <button
                  className="account-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  Signed as {user.username}
                </button>
                {showDropdown && (
                  <div className="navbar-dropdown-menu">
                    <a href="/profile" className="navbar-dropdown-item">Profile</a>
                    <a href="#" onClick={handleLogout} className="navbar-dropdown-item">Logout</a>
                  </div>
                )}
              </div>
            ) : (
              <NavDropdown
                title="Account"
                id="account-dropdown"
                className="navbar-dropdown account-button"
              >
                <NavDropdown.Item
                  className="navbar-dropdown-item"
                  href="/login"
                >
                  Login
                </NavDropdown.Item>
                <NavDropdown.Item
                  className="navbar-dropdown-item"
                  href="/register"
                >
                  Register
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavBar;
