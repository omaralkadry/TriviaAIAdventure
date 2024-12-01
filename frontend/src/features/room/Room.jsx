//NOTINUSE


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import './RoomStyles.css';
import './animations.css';

const Room = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [gameMode, setGameMode] = useState('classic');
  const [timeLimit, setTimeLimit] = useState(30);
  const [numQuestions, setNumQuestions] = useState(10);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Create room if coming from home with room name
    const params = new URLSearchParams(location.search);
    const roomName = params.get('name');
    if (roomName && !roomCode) {
      handleCreateRoom();
    }
  }, [user, navigate, location, roomCode]);

  const handleCreateRoom = () => {
    const newRoomCode = Math.floor(10000 + Math.random() * 90000).toString();
    setRoomCode(newRoomCode);
    setPlayers([user.username]);
    document.querySelector('.room-container').classList.add('room-created');
  };

  const handleJoinRoom = (code) => {
    if (code.length === 5) {
      setRoomCode(code);
      setPlayers([...players, user.username]);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    if (gameMode === 'classic') {
      document.querySelector('.room-container').classList.add('room-exit');
      setTimeout(() => {
        navigate(`/play/${roomCode}`, {
          state: {
            gameMode,
            timeLimit,
            numQuestions
          }
        });
      }, 500);
    }
  };

  return (
    <div className="room-container fade-in">
      <div className="room-header slide-up">
        <h2>Trivia Room</h2>
        {roomCode && (
          <div className="room-code bounce">
            Room Code: {roomCode}
          </div>
        )}
      </div>

      {!roomCode ? (
        <div className="initial-options stagger-children">
          <div className="create-room settings-group room-card">
            <h3 className="settings-label">Create a New Room</h3>
            <p>Start a new trivia game and invite your friends</p>
            <button
              onClick={handleCreateRoom}
              className="room-button hover-bright"
            >
              Create Room
            </button>
          </div>

          <div className="join-room settings-group room-card">
            <h3 className="settings-label">Join Existing Room</h3>
            <p>Enter a room code to join an existing game</p>
            <input
              type="text"
              placeholder="Enter Room Code"
              onChange={(e) => handleJoinRoom(e.target.value)}
              className="settings-input"
            />
          </div>
        </div>
      ) : (
        <div className="room-active stagger-children">
          <div className="room-code-container scale-in">
            <h3 className="room-code pulse-animation">Room Code: {roomCode}</h3>
            <button
              className={`copy-button hover-effect ${copied ? 'copied' : ''}`}
              onClick={handleCopyCode}
              title="Copy room code"
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>

          <p className="waiting-status fade-in delay-200">Share this code with your friends</p>

          <div className="players-list room-card slide-up delay-300">
            <h3 className="settings-label">Players</h3>
            <div className="player-items">
              {players.map((player, index) => (
                <div key={index} className="player-item">
                  {player}
                </div>
              ))}
            </div>
          </div>

          <div className="game-settings stagger-children delay-300">
            <h2 className="fade-in">Game Settings</h2>
            <form onSubmit={(e) => e.preventDefault()} className="settings-form">
              <div className="setting-group room-card hover-lift">
                <label>🎮 Game Mode</label>
                <select
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value)}
                  className="settings-input"
                >
                  <option value="classic">Classic Trivia</option>
                  <option value="board">Trivia Board</option>
                  <option value="random">Random Trivia</option>
                </select>
              </div>

              <div className="setting-group room-card hover-lift">
                <label>⏱️ Time Limit</label>
                <input
                  type="range"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  min="10"
                  max="60"
                  step="5"
                  className="settings-input"
                />
                <span className="setting-value">{timeLimit} seconds</span>
              </div>

              <div className="setting-group room-card hover-lift">
                <label>Number of Questions</label>
                <input
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Math.min(50, Math.max(5, e.target.value)))}
                  min="5"
                  max="50"
                  className="settings-input"
                />
              </div>
            </form>

            <button
              onClick={handleStartGame}
              className="start-game-btn hover-bright bounce"
            >
              Start Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
