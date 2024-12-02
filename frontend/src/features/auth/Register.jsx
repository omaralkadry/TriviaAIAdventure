import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { useAuth } from '../../services/AuthContext';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await register(formData.username, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="register-container">
            <Form onSubmit={handleSubmit} className="register-form">
                <h2 className="register-title">Create Account</h2>
                {error && <div className="error-message">{error}</div>}

                <Form.Group className="form-group">
                    <Form.Label className="form-label">Username</Form.Label>
                    <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Choose a username"
                        required
                        className="form-control"
                    />
                </Form.Group>

                <Form.Group className="form-group">
                    <Form.Label className="form-label">Password</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Choose a password"
                        required
                        className="form-control"
                    />
                </Form.Group>

                <Form.Group className="form-group">
                    <Form.Label className="form-label">Confirm Password</Form.Label>
                    <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                        className="form-control"
                    />
                </Form.Group>

                <Button type="submit" className="register-button">
                    Create Account
                </Button>

                <Link to="/login" className="login-link">
                    Already have an account? Login here
                </Link>
            </Form>
        </div>
    );
};

export default Register;
