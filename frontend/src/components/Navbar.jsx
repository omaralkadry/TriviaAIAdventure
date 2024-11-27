import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { Navbar as BootstrapNavbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Navbar.css";

// Import icons from react-icons
import { AiOutlineHome, AiOutlineTrophy, AiOutlineLogin, AiOutlineMessage, AiOutlinePlayCircle, AiOutlineUser } from 'react-icons/ai';
import { GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';

const Navbar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, getUsername, logout } = useAuth();
    const [username, setUsername] = useState(getUsername());
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        setUsername(getUsername());
    }, [getUsername]);

    const handleDropdownToggle = (isOpen) => {
        setDropdownOpen(isOpen);
    };

    return (
        <BootstrapNavbar expand="lg" className="navbar">
            <Container className="navbar-content">
                <BootstrapNavbar.Brand as={Link} to="/" className="navbar-brand">
                    Trivia AI
                </BootstrapNavbar.Brand>
                <BootstrapNavbar.Toggle aria-controls="navbar-nav" />
                <BootstrapNavbar.Collapse id="navbar-nav">
                    <Nav className="navbar-links">
                        <Nav.Link as={Link} to="/" className="nav-link">
                            <AiOutlineHome /> Home
                        </Nav.Link>
                        <Nav.Link as={Link} to="/play" className="nav-link">
                            <AiOutlinePlayCircle /> Play Test
                        </Nav.Link>
                        <Nav.Link as={Link} to="/chat" className="nav-link">
                            <AiOutlineMessage /> Chat
                        </Nav.Link>
                        <Nav.Link as={Link} to="/leaderboard" className="nav-link">
                            <AiOutlineTrophy /> Leaderboard
                        </Nav.Link>
                        <Nav.Link as={Link} to="/jeopardy" className="nav-link">
                            <GiPerspectiveDiceSixFacesRandom /> Jeopardy
                        </Nav.Link>
                        <Nav.Link as={Link} to="/history" className="nav-link">
                            History
                        </Nav.Link>
                        <NavDropdown
                            title={
                                <span className={`account-text ${dropdownOpen ? 'active' : ''}`}>
                                    <AiOutlineUser className="nav-icon" />
                                    {isAuthenticated() ? `Signed as ${username}` : 'Account'}
                                </span>
                            }
                            id="account-dropdown"
                            className={`account-dropdown ${dropdownOpen ? 'show' : ''}`}
                            align="end"
                            show={dropdownOpen}
                            onToggle={handleDropdownToggle}
                        >
                            {isAuthenticated() ? (
                                <NavDropdown.Item
                                    onClick={() => {
                                        logout();
                                        setUsername(null);
                                        setDropdownOpen(false);
                                        navigate('/');
                                    }}
                                    className="dropdown-item"
                                >
                                    <AiOutlineLogin className="dropdown-icon" /> Logout
                                </NavDropdown.Item>
                            ) : (
                                <>
                                    <NavDropdown.Item
                                        as={Link}
                                        to="/login"
                                        className="dropdown-item"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <AiOutlineLogin className="dropdown-icon" /> Login
                                    </NavDropdown.Item>
                                    <NavDropdown.Item
                                        as={Link}
                                        to="/register"
                                        className="dropdown-item"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <AiOutlineUser className="dropdown-icon" /> Register
                                    </NavDropdown.Item>
                                </>
                            )}
                        </NavDropdown>
                    </Nav>
                </BootstrapNavbar.Collapse>
            </Container>
        </BootstrapNavbar>
    );
};

export default Navbar;
