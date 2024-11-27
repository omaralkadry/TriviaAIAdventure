import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreateRoom = () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }
    navigate(`/room?name=${encodeURIComponent(roomName.trim())}`);
  };

  const handleJoinRoom = () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    if (!roomCode.trim()) {
      alert('Please enter a room code');
      return;
    }
    navigate(`/room/${roomCode.trim()}`);
  };

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1>Welcome to Trivia Ai Adventures</h1>
        <p className="welcome-text">Test your knowledge and challenge your friends!</p>
      </div>

      <div className="rooms-section">
        <div className="room-card create-room">
          <h2>Start</h2>
          <p>Start a new trivia game and invite your friends</p>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter room name"
              className="room-input"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
            />
            <button
              className="room-button"
              onClick={handleCreateRoom}
            >
              Start
            </button>
          </div>
        </div>
        {/*
        <div className="room-card join-room">
          <h2>Join a Room</h2>
          <p>Enter a room code to join an existing game</p>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter room code"
              className="room-input"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
            <button
              className="room-button"
              onClick={handleJoinRoom}
            >
              JOIN ROOM
            </button>
          </div>
        </div>
        */}
      </div>
    </div>
  );
};

export default Home;
