import { useState } from "react";
import { Button, Card, Container, Col, Form, Row } from "react-bootstrap";
import { useAuth } from "../../services/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Form.css"; // Ensure you have styling for the form

function LoginForm({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: username, password: password }),
        };

        fetch(`${import.meta.env.VITE_BASE_URL}/login`, options).then((response) => {
            if (response.ok) {
                console.log("Login Successful");
                response.json().then((data) => {
                    login(data);
                });

                const redirectPath = localStorage.getItem("redirectPath");
                navigate(redirectPath || "/");
                localStorage.removeItem("redirectPath");
            } else {
                console.log("Login Unsuccessful");
            }
        });
    };

    return (
        <Container
            fluid
            className="d-flex justify-content-center align-items-center form-page-container"
        >
            <Row className="justify-content-center">
                <Col md={10}>
                    <Card className="form-card">
                        <Card.Title className="form-title">Login</Card.Title>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="form-control mb-3" controlId="formBasicUsername">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="form-control mb-3" controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="btn">
                                Enter
                            </Button>
                            <div className="form-footer">
                                <p>
                                    Don't have an account?{" "}
                                    <a href="/register" className="form-link">
                                        Register here
                                    </a>
                                </p>
                            </div>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default LoginForm;