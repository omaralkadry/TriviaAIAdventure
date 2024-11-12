import React, { useEffect, useState, useCallback } from 'react';
import { Button, Container, Col, Row, Form, Table, Alert } from 'react-bootstrap';
import Play from '../play/Play';
import './RoomPage.css';
import { useAuth } from '../../services/AuthContext.jsx';
import Chat from '../../components/Chat';
import { useSocket } from '../../services/SocketContext';

javascript
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
  const [key, setKey] = useState(Date.now());
  const [scores, setScores] = useState({});
  const [isHost, setIsHost] = useState(false);
  const username = getUsername();

  // Game and room settings
  const [topic, setTopic] = useState('');
  const [totalQuestions, setTotalQuestions] = useState('');
  const [mode, setMode] = useState('');
	const [duration, setDuration] = useState('');
  const [jeopardyTopics, setJeopardyTopics] = useState(Array(6).fill(''));

  useEffect(() => {
    if (!socket) return;

    const handleUpdatePlayers = (updatedPlayers) => {
      setPlayers(updatedPlayers);
      setCanStart(updatedPlayers.length >= 1);
    };

    const handleQuestion = (allQuestions) => {
      setQuestions(allQuestions.questions);
      setDuration(allQuestions.duration);
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

    const handleHostStatus = (status) => {
      setIsHost(status);
    };

    const handleGameSettings = (settings) => {
      if (settings.mode !== undefined) setMode(settings.mode);
      if (settings.duration !== undefined) setDuration(settings.duration);
      if (settings.topic !== undefined) setTopic(settings.topic);
      if (settings.totalQuestions !== undefined) setTotalQuestions(settings.totalQuestions);
    };

    socket.on('update players', handleUpdatePlayers);
    socket.on('question', handleQuestion);
    socket.on('game over', handleGameOver);
    socket.on('start game', handleStartGame);
    socket.on('answer result', handleAnswerResult);
    socket.on('update scores', handleUpdateScores);
    socket.on('host status', handleHostStatus);
    socket.on('game settings', handleGameSettings);

    return () => {
      socket.off('update players', handleUpdatePlayers);
      socket.off('question', handleQuestion);
      socket.off('game over', handleGameOver);
      socket.off('start game', handleStartGame);
      socket.off('answer result', handleAnswerResult);
      socket.off('update scores', handleUpdateScores);
      socket.off('host status', handleHostStatus);
      socket.off('game settings', handleGameSettings);
    };
  }, [socket]);

  const handleCreateRoom = useCallback(() => {
    if (!socket) return;
    socket.emit('create room', username, (response) => {
      if (response.success) {
        setRoomCode(response.roomCode);
        setIsHost(true); // Set host status when creating room
      }
    });
  }, [socket, username]);

  const handleJoinRoom = useCallback(() => {
    if (!socket) return;
    socket.emit('join room', joinRoomCode, username, (response) => {
      setJoinStatus(response.message);
      if (response.success) {
        setRoomCode(joinRoomCode);
        setIsHost(false); // Joining players are not hosts
      }
    });
  }, [socket, joinRoomCode, username]);

  const handleStartGame = useCallback(() => {
    if (!socket) return;
    socket.emit('start game', roomCode, topic, totalQuestions, duration, mode, (response) => {
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

  // Jeopardy game settings six topics
  const handleTopicChange = (index, value) => {
    setJeopardyTopics((prevTopics) => {
      // Create a copy of the current topics
      const newTopics = [...prevTopics];

      // Update the specific index with the new value
      newTopics[index] = value; 
      
      return newTopics;
    });
  };

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
            timePerQuestion= {duration}
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

        {/*
          This is game settings UI
          Show only if room code present and user is host
        */}
        {roomCode && isHost && (
          <>
            {/* All game modes general settings */}
            <Row className="justify-content-center mb-3">
              <Col md={3}>
                <Form.Select
                  value={mode}
                  onChange={(e) => {
                    const newMode = parseInt(e.target.value, 10);
                    socket.emit('update_game_mode', roomCode, newMode, (response) => {
                      if (response.success) {
                        setMode(newMode);
                      }
                    });
                  }}
                >
                  <option value="" disabled>Select Game Mode</option>
                  <option value={0}>Classic Trivia</option>
                  <option value={1}>Jeopardy</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Control
                  type='number'
                  value={duration}
                  onChange={(e) => {
                    const newDuration = parseInt(e.target.value, 10);
                    socket.emit('update_duration', roomCode, newDuration, (response) => {
                      if (response.success) {
                        setDuration(newDuration);
                      }
                    });
                  }}
                  min={1}
                  placeholder='Enter Question Time Limit (seconds)'
                />
              </Col>
            </Row>

            {/* Mode specific game settings */}
            <Row className="justify-content-center mb-3">

              {/* Classic trivia */}
              { mode === 0 ?
                <>
                  <Col md={3}>
                    <Form.Control
                      type="text"
                      value={topic}
                      onChange={(e) => {
                        const newTopic = e.target.value;
                        socket.emit('update_topic', roomCode, newTopic, (response) => {
                          if (response.success) {
                            setTopic(newTopic);
                          }
                        });
                      }}
                      placeholder="Enter Trivia Topic"
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      type="text"
                      value={totalQuestions}
                      onChange={(e) => {
                        const newTotal = e.target.value;
                        socket.emit('update_total_questions', roomCode, newTotal, (response) => {
                          if (response.success) {
                            setTotalQuestions(newTotal);
                          }
                        });
                      }}
                      placeholder="Enter Number of Questions"
                    />
                  </Col>
                </>
                : <></>
              }

              {/* Jeopardy */}
              { mode === 1 ?
                <>
                  {jeopardyTopics.map((input, index) => (
                    <Col key={index} md={2}>
                      <Form.Group controlId={`input-${index}`}>
                        <Form.Control
                          type="text"
                          value={input}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            socket.emit('update_jeopardy_topic', roomCode, index, newValue, (response) => {
                              if (response.success) {
                                handleTopicChange(index, newValue);
                              }
                            });
                          }}
                          placeholder={`Enter Topic ${index + 1}`}
                        />
                      </Form.Group>
                    </Col>
                  ))}
                </>
                : <></>
              }
            </Row>
          </>
        )}

        {canStart && isHost && (
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
