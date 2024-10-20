import React, { useEffect, useState, useCallback } from 'react';
import { Button, Container, Col, Row, Form, Table, Alert } from 'react-bootstrap';
import Play from '../play/Play';
import './RoomPage.css';
import { useAuth } from '../../services/AuthContext.jsx';
import Chat from '../../components/Chat';
import { useSocket } from '../../services/SocketContext';

function RoomPage() {
  const socket = useSocket();
  const { isAuthenticated, getUsername } = useAuth();
  const [players, setPlayers] = useState([]);
  const [roomCode, setRoomCode] = useState(null);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinStatus, setJoinStatus] = useState('');
  const [canStart, setCanStart] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(-1);
  const [isCountdownFinished, setIsCountdownFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [answerResponse, setAnswerResponse] = useState(null);
  const [topic, setTopic] = useState('');
  const [totalQuestions, setTotalQuestions] = useState('');
  const [key, setKey] = useState(Date.now());
  const [scores, setScores] = useState({});
  const username = getUsername();

  useEffect(() => {
    if (!socket) return;

    const handleUpdatePlayers = (updatedPlayers) => {
      setPlayers(updatedPlayers);
      setCanStart(updatedPlayers.length >= 1);
    };

    const handleQuestion = (allQuestions) => {
      setQuestions(allQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(-1);
      setIsCountdownFinished(false);
      setKey(Date.now());
    };

    const handleGameOver = (data) => {
      alert(data.message);
      setGameOver(true);
      setGameStarted(false);
    };

    const handleStartGame = () => {
      setGameOver(false);
      setGameStarted(true);
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(-1);
    };

    const handleAnswerResult = (data) => {
      setAnswerResponse(data.result);
      setTimeout(() => setAnswerResponse(null), 5000);
    };

    const handleUpdateScores = (updatedScores) => {
      console.log('Updated Scores:', updatedScores);
      setScores(updatedScores);
    };

    socket.on('update players', handleUpdatePlayers);
    socket.on('question', handleQuestion);
    socket.on('game over', handleGameOver);
    socket.on('start game', handleStartGame);
    socket.on('answer result', handleAnswerResult);
    socket.on('update scores', handleUpdateScores);

    return () => {
      socket.off('update players', handleUpdatePlayers);
      socket.off('question', handleQuestion);
      socket.off('game over', handleGameOver);
      socket.off('start game', handleStartGame);
      socket.off('answer result', handleAnswerResult);
      socket.off('update scores', handleUpdateScores);
    };
  }, [socket]);

  const handleCreateRoom = useCallback(() => {
    if (!socket) return;
    socket.emit('create room', username, (response) => {
      if (response.success) {
        setRoomCode(response.roomCode);
      }
    });
  }, [socket, username]);

  const handleJoinRoom = useCallback(() => {
    if (!socket) return;
    socket.emit('join room', joinRoomCode, username, (response) => {
      setJoinStatus(response.message);
      if (response.success) {
        setRoomCode(joinRoomCode);
      }
    });
  }, [socket, joinRoomCode, username]);

  const handleStartGame = useCallback(() => {
    if (!socket) return;
    socket.emit('start game', roomCode, topic, totalQuestions, (response) => {
      if (!response.success) {
        alert(response.message);
      }
    });
  }, [socket, roomCode, topic, totalQuestions]);

  const handleAnswerSubmit = useCallback(() => {
    if (!socket) return;
    socket.emit('submit answer', roomCode, username, selectedAnswer, currentQuestionIndex);
  }, [socket, roomCode, username, selectedAnswer, currentQuestionIndex]);

  const handleCountdownFinish = useCallback(() => {
    setIsCountdownFinished(true);
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(-1);
      setIsCountdownFinished(false);
      setKey(Date.now());
    } else {
      if (socket) {
        socket.emit('game over', roomCode);
      }
      setGameOver(true);
    }
  }, [currentQuestionIndex, questions.length, socket, roomCode]);

  const handleBackToLobby = useCallback(() => {
    setGameOver(false);
    setGameStarted(false);
    setScores({});
  }, []);

  const renderGameContent = () => {
    if (gameStarted && questions.length > 0 && !gameOver) {
      return (
        <>
          {answerResponse && (
            <Alert variant={answerResponse === 'correct' ? 'success' : 'danger'}>
              {answerResponse === 'correct' ? 'Correct Answer!' : 'Wrong Answer!'}
            </Alert>
          )}
          <Play
            currentQuestion={questions[currentQuestionIndex]}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
            isCountdownFinished={isCountdownFinished}
            handleAnswerSubmit={handleAnswerSubmit}
            handleCountdownFinish={handleCountdownFinish}
            handleNextQuestion={handleNextQuestion}
            key={key}
          />
        </>
      );
    }

    if (gameOver) {
      return (
        <>
          <h2>Game Over</h2>
          <Table bordered>
            <thead>
              <tr>
                <th>Player</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scores).map(([player, score]) => (
                <tr key={player}>
                  <td>{player}</td>
                  <td>{score}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Button onClick={handleBackToLobby}>Back to Lobby</Button>
        </>
      );
    }

    return (
      <>
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

        {roomCode && (
          <Row className="justify-content-center mb-3">
            <Col md={3}>
              <Form.Control
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter Trivia Topic"
              />
            </Col>
            <Col md={3}>
              <Form.Control
                type="text"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(e.target.value)}
                placeholder="Enter Number of Questions"
              />
            </Col>
          </Row>
        )}

        {canStart && (
          <Row className="justify-content-center mb-3">
            <Col md={6}>
              <Button onClick={handleStartGame}>Start Game</Button>
            </Col>
          </Row>
        )}
      </>
    );
  };

  return (
    <Container fluid>
      <Row>
        <Col md={gameStarted && isAuthenticated() ? 8 : 12} className="mt-5 text-center">
          {renderGameContent()}
        </Col>
        {gameStarted && isAuthenticated() && roomCode && (
          <Col md={4} className="mt-5">
            <Chat roomCode={roomCode} />
          </Col>
        )}
      </Row>
    </Container>
  );
}
export default RoomPage;
