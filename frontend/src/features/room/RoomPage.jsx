import { useEffect, useState } from 'react';
import { Button, Container, Col, Row, Form, Table, Alert } from 'react-bootstrap'; // Import Alert for indicators
import io from 'socket.io-client';
import Play from '../play/Play';
import './RoomPage.css';
import { useAuth } from '../../services/AuthContext.jsx';

function RoomPage() {
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const [roomCode, setRoomCode] = useState(null);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinStatus, setJoinStatus] = useState('');
  const [canStart, setCanStart] = useState(false);
  const [questions, setQuestions] = useState([]); // added (stores all questions) -omar
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // added
  //const [currentQuestion, setCurrentQuestion] = useState(null); //dont need i think -omar
  const [selectedAnswer, setSelectedAnswer] = useState(-1);
  const [isCountdownFinished, setIsCountdownFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [answerResponse, setAnswerResponse] = useState(null);
  const [topic, setTopic] = useState('');
  const [totalQuestions, setTotalQuestions] = useState('');
  const [key, setKey] = useState(Date.now());  // Use timestamp as a key to reset the timer
  const { getUsername } = useAuth();
  const username = getUsername();

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // Listen for the players list update
    newSocket.on('update players', (updatedPlayers) => {
      setPlayers(updatedPlayers);
      setCanStart(updatedPlayers.length >= 1);
    });

    // Listen for trivia questions
    newSocket.on('question', (allQuestions) => {
      setQuestions(allQuestions);  //changed by Omar
      setCurrentQuestionIndex(0);  //this added
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
      setGameOver(false);
      setGameStarted(true);
      //may not be needed - Omar
      setQuestions([]); // Clear previous questions if any
      setCurrentQuestionIndex(0); // Reset question index
      setSelectedAnswer(-1); // Reset selected answer
    });

    // Listen for answer result
    newSocket.on('answer result', (data) => {
      setAnswerResponse(data.result);
      setTimeout(() => setAnswerResponse(null), 5000);  // Clear after 3 seconds
    });

     // Listen for the updated scores added -omar
     newSocket.on('update scores', (scores) => {
      console.log('Updated Scores:', scores);
      // TODO adjust here to display scores on the frontend later
  });

    return () => newSocket.close();
  }, []);

  const handleCreateRoom = () => {

    socket.emit('create room',  username , (response) => {
      if (response.success) {
        setRoomCode(response.roomCode);
      }
    });
  };

  const handleJoinRoom = () => {

    socket.emit('join room', joinRoomCode, username , (response) => {
      setJoinStatus(response.message);
      if (response.success) {
        setRoomCode(joinRoomCode); // Set the room code for the user who joins successfully
      }
    });
  };

  //adjusted, not sure how player usernames are going to be stored -Omar
  const handleStartGame = () => {
    // const hardcodedTopic = "science";
    // const hardcodedTotalQuestions = 3;

    socket.emit('start game', roomCode, topic, totalQuestions, (response) => {
      if (!response.success) {
        alert(response.message);
      }
    });
  };

  // Not used currently
  const handleAnswerSubmit = () => {
    console.log("works")
    socket.emit('submit answer', roomCode, username, selectedAnswer, currentQuestionIndex);

    // // When answer is correct
    // if (questions[currentQuestionIndex].answer == selectedAnswer) {
    //   setIsCountdownFinished(true);
    // }
    // else { // Answer is not correct
    //   setIsCountdownFinished(true);
    // }
  };

  const handleCountdownFinish = () => {
    setIsCountdownFinished(true);
  };

  //added by omar
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(-1);
      setIsCountdownFinished(false);
      setKey(Date.now()); // Reset timer for the next question
    } else {
      socket.emit('game over', roomCode);
      setGameOver(true);
    }
  };

  if (gameStarted && questions.length > 0 && !gameOver) { //adjusted by omar
    return (
        <>
          {answerResponse && (
              <Alert variant={answerResponse === 'correct' ? 'success' : 'danger'}>
                {answerResponse === 'correct' ? 'Correct Answer!' : 'Wrong Answer!'}
              </Alert>
          )}
          <Play
              currentQuestion={questions[currentQuestionIndex]} //adjusted by omar
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
      </Container>
  );
}

export default RoomPage;