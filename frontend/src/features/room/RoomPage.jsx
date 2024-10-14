import { useEffect, useState } from 'react';
import { Button, Container, Col, Row, Form, Table, Alert } from 'react-bootstrap'; // Import Alert for indicators
import io from 'socket.io-client';
import Play from '../play/Play';
import './RoomPage.css';

function RoomPage() {
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const [roomCode, setRoomCode] = useState(null);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinStatus, setJoinStatus] = useState('');
  const [canStart, setCanStart] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(-1);
  const [isCountdownFinished, setIsCountdownFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [answerResponse, setAnswerResponse] = useState(null);
  const [key, setKey] = useState(Date.now());  // Use timestamp as a key to reset the timer

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // Listen for the players list update
    newSocket.on('update players', (updatedPlayers) => {
      setPlayers(updatedPlayers);
      setCanStart(updatedPlayers.length >= 2);
    });

    // Listen for trivia questions
    newSocket.on('question', (question) => {
      setCurrentQuestion(question);
      setSelectedAnswer(-1);
      setIsCountdownFinished(false);
      setKey(Date.now()); // Reset timer
    });

    // Listen for game over event
    newSocket.on('game over', (data) => {
      alert(data.message);
      setGameOver(true);
      setGameStarted(false);
    });

    // Listen for start game event
    newSocket.on('start game', () => {
      setGameStarted(true);
    });

    // Listen for answer result
    newSocket.on('answer result', (data) => {
      setAnswerResponse(data.result);
      setTimeout(() => setAnswerResponse(null), 5000);  // Clear after 3 seconds
    });

    return () => newSocket.close();
  }, []);

  const handleCreateRoom = () => {
    socket.emit('create room', (response) => {
      if (response.success) {
        setRoomCode(response.roomCode);
      }
    });
  };

  const handleJoinRoom = () => {
    socket.emit('join room', joinRoomCode, (response) => {
      setJoinStatus(response.message);
      if (response.success) {
        setRoomCode(joinRoomCode); // Set the room code for the user who joins successfully
      }
    });
  };

  const handleStartGame = () => {
    socket.emit('start game', roomCode, "science", players, 3, (response) => {
      if (!response.success) {
        alert(response.message);
      }
    });
  };

  const handleAnswerSubmit = () => {
    socket.emit('submit answer', roomCode, selectedAnswer);
  };

  const handleCountdownFinish = () => {
    setIsCountdownFinished(true);
  };

  if (gameStarted && currentQuestion && !gameOver) {
    return (
        <>
          {answerResponse && (
              <Alert variant={answerResponse === 'correct' ? 'success' : 'danger'}>
                {answerResponse === 'correct' ? 'Correct Answer!' : 'Wrong Answer!'}
              </Alert>
          )}
          <Play
              currentQuestion={currentQuestion}
              selectedAnswer={selectedAnswer}
              setSelectedAnswer={setSelectedAnswer}
              isCountdownFinished={isCountdownFinished}
              handleAnswerSubmit={handleAnswerSubmit}
              handleCountdownFinish={handleCountdownFinish}
              key={key}
          />
        </>
    );
  }

  return (
      <Container className="mt-5 text-center">
        <Row className="justify-content-center mb-3">
          <Col md={6}>
            <Button onClick={handleCreateRoom}>Create Room</Button>
          </Col>
        </Row>

        <Row className="justify-content-center mb-3">
          <Col md={6}>
            <Form.Control
                type="text"
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value)}
                placeholder="Enter Room Code"
            />
          </Col>
          <Col md={2}>
            <Button onClick={handleJoinRoom}>Join Room</Button>
          </Col>
        </Row>

        <Row className="justify-content-center mb-3">
          <Col md={12}>
            <div>{joinStatus}</div>
          </Col>
        </Row>

        {roomCode && (
            <Row className="justify-content-center mb-3">
              <Col md={12}>
                <h3>Room Code: {roomCode}</h3>
              </Col>
            </Row>
        )}

        <Row className="justify-content-center mb-3">
          <Col md={6}>
            <Table bordered>
              <thead><tr><th>Players</th></tr></thead>
              <tbody>
              {players.map((playerId, idx) => (
                  <tr key={idx}><td>{playerId}</td></tr>
              ))}
              </tbody>
            </Table>
          </Col>
        </Row>

        {canStart && (
            <Row className="justify-content-center mb-3">
              <Col md={6}>
                <Button onClick={handleStartGame}>Start Game</Button>
              </Col>
            </Row>
        )}
      </Container>
  );
}

export default RoomPage;