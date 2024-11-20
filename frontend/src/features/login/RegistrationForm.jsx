import React, { useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Form.css';

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

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    };

    fetch("http://localhost:3000/register", options)
        .then(response => {
          if (response.ok) {
            response.json().then(data => {
              login(data);
            });
            const redirectPath = localStorage.getItem('redirectPath');
            navigate(redirectPath || '/');
            localStorage.removeItem('redirectPath');
          } else {
            console.log("Registration Unsuccessful");
          }
        });
  };

  return (
      <div className="form-page-container">
        <div className="form-card">
          <h2 className="form-title">Register</h2>
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
          </form>
        </div>
      </div>
  );
}

export default RegistrationForm;
