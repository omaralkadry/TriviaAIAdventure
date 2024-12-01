import React from 'react';
import { Card } from 'react-bootstrap';
import './Sidebar.css';

function RoomCodeTab({ roomCode }) {
  return (
    <Card className="room-code-tab">
      <Card.Body>
        <Card.Title className="text-center mb-4">Room Code</Card.Title>
        <div className="room-code-display">
          <h2 className="text-center code-text">{roomCode}</h2>
        </div>
        <div className="room-code-info">
          <p className="text-center mt-3">
            Share this code with other players to join the game
          </p>
        </div>
      </Card.Body>
    </Card>
  );
}

export default RoomCodeTab;
