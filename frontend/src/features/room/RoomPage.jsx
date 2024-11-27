import React, { useEffect, useState, useCallback } from 'react';
import { Button, Container, Col, Row, Form, Table, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import Play from '../play/Play';
import './RoomPage.css';
import './animations.css';
import './roomInteractions.css';
import { useAuth } from '../../services/AuthContext.jsx';
import Chat from '../../components/Chat';
import { useSocket } from '../../services/SocketContext';
import JeopardyBoard from '../play/Jeopardy/Jeopardy.jsx';
import Sidebar from '../../components/Sidebar.jsx';

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
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isCountdownFinished, setIsCountdownFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [roomStatus, setRoomStatus] = useState('waiting');
  const navigate = useNavigate();
  const location = useLocation();
  const [answerResponse, setAnswerResponse] = useState(null);
  const [key, setKey] = useState(Date.now());
  const [scores, setScores] = useState({});
  const username = getUsername();
  const [selector, setSelector] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [isHost, setIsHost] = useState(false);

  // Game and room settings
  const [topic, setTopic] = useState('');
  const [totalQuestions, setTotalQuestions] = useState('');
  const [mode, setMode] = useState(-1);
  const [duration, setDuration] = useState('');
  const [jeopardyTopics, setJeopardyTopics] = useState(Array(6).fill(''));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomName = params.get('name');
    const code = params.get('code');

    if (roomName && !roomCode) {
      handleCreateRoom();
    } else if (code && !roomCode) {
      setJoinRoomCode(code);
      handleJoinRoom();
    }
  }, [location]);

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
      setSelectedAnswer('');
      setIsCountdownFinished(false);
      setKey(Date.now());
      setWaiting(false);
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
      setSelectedAnswer('');
      setWaiting(true);
      setRoomStatus('in-progress');
    };

    const handleAnswerResult = (data) => {
      setAnswerResponse(data.result);
      setTimeout(() => setAnswerResponse(null), 5000);
    };

    const handleUpdateScores = (updatedScores) => {
      setScores(updatedScores);
    };

    const handleGameSettings = (settings) => {
      if (settings.mode !== undefined) setMode(settings.mode);
      if (settings.duration !== undefined) setDuration(settings.duration);
      if (settings.topic !== undefined) setTopic(settings.topic);
      if (settings.jeopardyTopics !== undefined) setJeopardyTopics(settings.jeopardyTopics);
      if (settings.totalQuestions !== undefined) setTotalQuestions(settings.totalQuestions);
    };

    const handleSelector = (selectorUsername) => {
      setSelector(selectorUsername);
    };

    const handleHostStatus = (status) => {
      setIsHost(status);
    };

    socket.on('update players', handleUpdatePlayers);
    socket.on('question', handleQuestion);
    socket.on('game over', handleGameOver);
    socket.on('start game', handleStartGame);
    socket.on('answer result', handleAnswerResult);
    socket.on('update scores', handleUpdateScores);
    socket.on('game settings', handleGameSettings);
    socket.on('next question selector', handleSelector);
    socket.on('host status', handleHostStatus);

    return () => {
      socket.off('update players', handleUpdatePlayers);
      socket.off('question', handleQuestion);
      socket.off('game over', handleGameOver);
      socket.off('start game', handleStartGame);
      socket.off('answer result', handleAnswerResult);
      socket.off('update scores', handleUpdateScores);
      socket.off('game settings', handleGameSettings);
      socket.off('next question selector', handleSelector);
      socket.off('host status', handleHostStatus);
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
    let topic_array = [];
    if (mode === 0) {
      topic_array.push(topic);
    } else if (mode === 1) {
      topic_array = jeopardyTopics;
    } else if (mode === 2) {
      // Random Trivia
    } else {
      console.error("Invalid game mode", mode);
    }

    socket.emit('start game', roomCode, topic_array, totalQuestions || 2, duration, mode, (response) => {
      if (!response.success) {
        alert(response.message);
      }
    });
  }, [socket, roomCode, topic, totalQuestions, duration, mode, jeopardyTopics]);

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
      setSelectedAnswer('');
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
    setRoomStatus('waiting');
  }, []);

  const handleTopicChange = (index, value) => {
    setJeopardyTopics((prevTopics) => {
      const newTopics = [...prevTopics];
      newTopics[index] = value;
      return newTopics;
    });
  };

  const renderGameContent = () => {
    if (gameStarted && questions.length > 0 && !gameOver) {
      if (mode === 0 || mode === 2) {
        return (
            <div className="fade-in stagger-children">
              {answerResponse && (
                  <Alert variant={answerResponse === 'correct' ? 'success' : 'danger'} className="scale-in">
                    {answerResponse === 'correct' ? 'Correct Answer!' : 'Wrong Answer!'}
                  </Alert>
              )}
              <div className="game-controls">
                <Play
                    timePerQuestion={duration}
                    currentQuestion={questions[currentQuestionIndex]}
                    selectedAnswer={selectedAnswer}
                    setSelectedAnswer={setSelectedAnswer}
                    isCountdownFinished={isCountdownFinished}
                    handleAnswerSubmit={handleAnswerSubmit}
                    handleCountdownFinish={handleCountdownFinish}
                    handleNextQuestion={handleNextQuestion}
                    freeResponse={mode === 2}
                    key={key}
                />
              </div>
            </div>
        );
      } else if (mode === 1) {
        return (
            <div className="fade-in stagger-children">
              <div className="game-controls">
                <JeopardyBoard
                    selectorUsername={selector}
                    questions={questions}
                    topics={jeopardyTopics}
                    duration={duration}
                />
              </div>
            </div>
        );
      }
    }

    if (gameOver) {
      return (
          <div className="room-card slide-up game-over-container">
            <span className="trophy-icon">🏆</span>
            <h2 className="text-center mb-4 glow-pulse">Game Over!</h2>
            <div className="scores-table fade-in delay-100">
              {Object.entries(scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([player, score], index) => (
                      <div key={player} className={`score-card ${index === 0 ? 'winner' : ''} hover-bright transition-all delay-${index * 100}`}>
                        <div className="d-flex align-items-center">
                          <span className="score-position">#{index + 1}</span>
                          {player}
                          {index === 0 && <span className="winner-label">Winner!</span>}
                        </div>
                        <span className="player-score">{score}</span>
                      </div>
                  ))}
            </div>
            <Button onClick={handleBackToLobby} className="room-button mt-4 interactive-element hover-scale">Back to Lobby</Button>
          </div>
      );
    }

    if (waiting) {
      return (
          <div className="room-card fade-in text-center loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading Game</div>
            <div className="loading-subtext">Preparing your trivia experience</div>
            <div className="loading-progress">
              <div className="loading-progress-bar"></div>
            </div>
          </div>
      );
    }

    return (
        <div className="stagger-children">
          <Row className="justify-content-center mb-4">
            <Col md={6}>
              <div className="room-card hover-lift">
                <div className="card-content scale-in">
                  <h2 className="glow-pulse mb-4">Create a New Room</h2>
                  <p className="text-center mb-4">Start a new trivia game and invite your friends</p>
                  <Button
                      onClick={handleCreateRoom}
                      className="room-button hover-scale transition-all"
                      disabled={!isAuthenticated()}
                  >
                    Create Room
                  </Button>
                  {!isAuthenticated() && (
                      <p className="text-warning mt-3 fade-in">Please login to create a room</p>
                  )}
                </div>
              </div>
            </Col>
          </Row>

          <Row className="justify-content-center mb-4">
            <Col md={6}>
              <div className="room-card hover-lift">
                <div className="card-content scale-in">
                  <h2 className="glow-pulse mb-4">Join Existing Room</h2>
                  <p className="text-center mb-4">Enter a room code to join an existing game</p>
                  <Form.Control
                      type="text"
                      value={joinRoomCode}
                      onChange={(e) => setJoinRoomCode(e.target.value)}
                      placeholder="Enter Room Code"
                      className="room-input hover-bright mb-3"
                  />
                  <Button
                      onClick={handleJoinRoom}
                      className="room-button hover-scale transition-all"
                      disabled={!joinRoomCode || !isAuthenticated()}
                  >
                    Join Room
                  </Button>
                  {!isAuthenticated() && (
                      <p className="text-warning mt-3 fade-in">Please login to join a room</p>
                  )}
                </div>
              </div>
            </Col>
          </Row>

          {joinStatus && (
              <Row className="justify-content-center mb-4 scale-in">
                <Col md={12}>
                  <Alert variant={joinStatus.includes('Success') ? 'success' : 'danger'}>
                    {joinStatus}
                  </Alert>
                </Col>
              </Row>
          )}

          {roomCode && (
              <Row className="justify-content-center mb-4 scale-in">
                <Col md={12}>
                  <div className="room-card text-center border-glow">
                    <div className="room-code-container">
                      <h3 className="room-code glow-pulse interactive-element">Room Code: {roomCode}</h3>
                      <Button
                          className="copy-button interactive-element"
                          onClick={() => {
                            navigator.clipboard.writeText(roomCode);
                            const button = event.target;
                            button.textContent = 'Copied!';
                            setTimeout(() => button.textContent = 'Click to Copy', 1500);
                          }}
                      >
                        Click to Copy
                      </Button>
                    </div>
                    <p className="text-muted mt-2">Share this code with your friends</p>
                    <div className={`room-status ${roomStatus}`}>
                      {roomStatus === 'waiting' ? 'Waiting for players...' : 'Game in progress'}
                    </div>
                  </div>
                </Col>
              </Row>
          )}


          <Row className="justify-content-center mb-4">
            <Col md={6}>
              <div className="players-table slide-up">
                <h3 className="text-center mb-3 glow-pulse">Players</h3>
                <div className="table-container transition-all">
                  <Table bordered hover variant="dark">
                    <tbody>
                    {players.map((playerId, idx) => (
                        <tr key={idx} className={`hover-bright transition-all delay-${idx * 100} player-join`}>
                          <td className="interactive-element">
                            {playerId}
                            <div className="player-status float-element"></div>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </Col>
          </Row>

          {roomCode && (
              <div className="game-settings">
                <div className="room-card hover-lift">
                  <h2 className="text-center mb-4 glow-pulse">Game Settings</h2>
                  <Form className="settings-grid">
                    <div className="setting-card">
                      <div className="setting-header">
                        <span className="setting-icon">🎮</span>
                        <Form.Label className="interactive-element">Game Mode</Form.Label>
                      </div>
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
                          disabled={!isHost}
                          className="mode-selector hover-bright"
                      >
                        <option value={-1} disabled>Select Game Mode</option>
                        <option value={0}>Classic Trivia</option>
                        <option value={1}>Trivia Board</option>
                        <option value={2}>Random Trivia</option>
                      </Form.Select>
                    </div>
                    <div className="setting-card">
                      <div className="setting-header">
                        <span className="setting-icon">⏱️</span>
                        <Form.Label className="interactive-element">Time Limit</Form.Label>
                      </div>
                      <div className="range-wrapper">
                        <span className="range-value">{duration}s</span>
                        <Form.Control
                            type="range"
                            value={duration}
                            onChange={(e) => {
                              const newDuration = parseInt(e.target.value, 10);
                              socket.emit('update_duration', roomCode, newDuration, (response) => {
                                if (response.success) {
                                  setDuration(newDuration);
                                }
                              });
                            }}
                            min="10"
                            max="60"
                            disabled={!isHost}
                            className="hover-bright interactive-element"
                        />
                      </div>
                    </div>
                    {mode === 0 && (
                        <>
                          <div className="setting-card">
                            <div className="setting-header">
                              <span className="setting-icon">📚</span>
                              <Form.Label className="interactive-element">Topic</Form.Label>
                            </div>
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
                                disabled={!isHost}
                                className="hover-bright interactive-element"
                            />
                          </div>
                          <div className="setting-card">
                            <div className="setting-header">
                              <span className="setting-icon">🔢</span>
                              <Form.Label className="interactive-element">Number of Questions</Form.Label>
                            </div>
                            <Form.Control
                                type="number"
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
                                disabled={!isHost}
                                min="5"
                                max="20"
                                className="hover-bright interactive-element"
                            />
                          </div>
                        </>
                    )}
                    {mode === 1 && (
                        <div className="setting-card jeopardy-topics">
                          <div className="setting-header">
                            <span className="setting-icon">🏆</span>
                            <Form.Label className="interactive-element">Jeopardy Topics</Form.Label>
                          </div>
                          {jeopardyTopics.map((input, index) => (
                              <Form.Control
                                  key={index}
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
                                  disabled={!isHost}
                                  className="hover-bright interactive-element mb-2"
                              />
                          ))}
                        </div>
                    )}
                    {mode === 2 && (
                        <div className="setting-card">
                          <div className="setting-header">
                            <span className="setting-icon">🔢</span>
                            <Form.Label className="interactive-element">Number of Questions</Form.Label>
                          </div>
                          <Form.Control
                              type="number"
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
                              disabled={!isHost}
                              min="5"
                              max="20"
                              className="hover-bright interactive-element"
                          />
                        </div>
                    )}
                  </Form>
                </div>
              </div>
          )}

          {canStart && isHost && (
              <Row className="justify-content-center mb-4 scale-in delay-300">
                <Col md={6}>
                  <Button
                      onClick={handleStartGame}
                      className="start-game-button bounce border-glow hover-scale transition-all interactive-element"
                      disabled={!players.length}
                  >
                    {players.length < 1 ? 'Waiting for Players...' : 'Start Game'}
                  </Button>
                </Col>
              </Row>
          )}
        </div>
    );
  };

  return (
      <Container fluid className="fade-in">
        <Row>
          <Col md={gameStarted && isAuthenticated() ? 8 : 12} className="mt-5 text-center">
            {renderGameContent()}
          </Col>
          {gameStarted && isAuthenticated() && roomCode && (
              <Col md={4} className="mt-5 slide-up">
                <Chat roomCode={roomCode} className="scale-in" />
              </Col>
          )}
        </Row>
      </Container>
  );
}

export default RoomPage;
