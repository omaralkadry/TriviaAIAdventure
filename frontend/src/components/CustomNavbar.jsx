import React, { useEffect, useState } from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useAuth } from "../services/AuthContext";
import "./CustomNavBar.css";

function CustomNavbar() {
  const { isAuthenticated, getUsername, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (event.clientY < 50 || isHovering) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isHovering]);

  return (
      <Navbar
          expand="lg"
          className={`custom-navbar ${isVisible ? "visible" : "hidden"}`}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
      >
        <Container>
          <Navbar.Brand className="navbar-brand" href="/">
            Trivia AI
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link className="navbar-link" href="/">
                Home
              </Nav.Link>
              <Nav.Link className="navbar-link" href="/play">
                Play Test
              </Nav.Link>
              <Nav.Link className="navbar-link" href="/chat">
                Chat
              </Nav.Link>
              <Nav.Link className="navbar-link" href="/leaderboard">
                Leaderboard
              </Nav.Link>
              <Nav.Link className="navbar-link" href="/jeopardy">
                Jeopardy
              </Nav.Link>
            </Nav>
            <Navbar.Collapse className="justify-content-end">
              {isAuthenticated() ? (
                  <Navbar.Text className="signed-in-text">
                    Signed in as:{" "}
                    <NavDropdown
                        title={getUsername()}
                        id="user-dropdown"
                        className="navbar-dropdown account-dropdown"
                    >
                      <NavDropdown.Item
                          className="navbar-dropdown-item"
                          onClick={handleLogout}
                      >
                        Logout
                      </NavDropdown.Item>
                    </NavDropdown>
                  </Navbar.Text>
              ) : (
                  <Navbar.Text>
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
                  </Navbar.Text>
              )}
            </Navbar.Collapse>
          </Navbar.Collapse>
        </Container>
      </Navbar>
  );
}

export default CustomNavbar;
