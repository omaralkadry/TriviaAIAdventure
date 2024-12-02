import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import './Jeopardy.css';
import Question from './Question.jsx';
import { useSocket } from '../../../services/SocketContext';
import { useAuth } from '../../../services/AuthContext';

const JeopardyBoard = ({ selectorUsername, questions, topics, duration }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState({});
  const [clickedQuestions, setClickedQuestions] = useState([]);
  const [selected, setSelected] = useState(false);
  const [selector, setSelector] = useState(selectorUsername);
  const socket = useSocket();
  const { getUsername } = useAuth();
  const username = getUsername();

  // Jeopardy board data
  const jeopardyPoints = [200, 400, 600, 800, 1000];
  const [jeopardyData, setJeopardyData] = useState(questions);
  const [jeopardyTopics, setJeopardyTopics] = useState(topics);

  // If question indices are already clicked previously
  const isClicked = (selectedIndex) => {
    return clickedQuestions.some(
      index => index === selectedIndex
    );
  };

  // Add the selectedQuestionIndex object to the clickedQuestions array
  const handleClick = (selectedQuestionIndex) => {
    setClickedQuestions(prevClickedQuestions => [
      ...prevClickedQuestions,
      selectedQuestionIndex
    ]);
  };

  // Converts question indices into question
  const indexToQuestion = (selectedIndex) => {
    const selectedQuestionObj = jeopardyData[selectedIndex];
    setSelectedQuestion(selectedQuestionObj);
  };

  // Handles clicked question
  const handleSelectedQuestion = (selectedIndex) => {
    // Makes sure user is the one selecting and has not clicked that index
    if ((selected || username === selectorUsername) && !isClicked(selectedIndex)) {
      socket.emit('selected question', selectedIndex );
    } else {
      console.log("You are not allowed to select that question right now.");
    }
  };

  // Handles sending 'back to board' to server
  const handleBackToBoard = () => {
    if (questions.length === clickedQuestions.length) {
      socket.emit('game over');
    } else {
      socket.emit('back to board');
    }
  };

  // Handlers socket.on receiving
  useEffect(() => {
    // Socket reconnection handler
    function handleReconnect() {
      console.log('Socket reconnected, rejoining game...');
      socket.emit('rejoin_game');
    }

    // Socket disconnect handler
    function handleDisconnect() {
      console.log('Socket disconnected, attempting to reconnect...');
    }

    // On who gets choose question
    function onSelector(selectorUsername) {
      console.log(`Selector: ${selectorUsername}`);
      setSelected(username === selectorUsername);
      setSelector(selectorUsername);
    }

    // On what the question is selected
    function onSelectedQuestion(selectedIndex) {
      console.log(`Selected index: ${selectedIndex}`);
      setQuestionIndex(selectedIndex);
      handleClick(selectedIndex);
      indexToQuestion(selectedIndex);
    }

    // Sets selected question to null, putting users to the board
    function onBackToBoard() {
      setSelectedQuestion(null);
    }

    if (socket) {
      socket.on('connect', handleReconnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('next question selector', onSelector);
      socket.on('selected question', onSelectedQuestion);
      socket.on('back to board', onBackToBoard);

      return () => {
        socket.off('connect', handleReconnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('next question selector', onSelector);
        socket.off('selected question', onSelectedQuestion);
        socket.off('back to board', onBackToBoard);
      };
    } else {
      console.warn('Jeopardy Board: Socket is not initialized');
    }
  }, [socket, username]);

  return (
    <Container className="jeopardy-container p-4" fluid>
      {/* Display board if not currently in a question */}
      {!selectedQuestion && (
        <React.Fragment>
          <Row xs={6} md={6} className="g-4">
            {/* Topic headers row */}
            {jeopardyTopics.map((topic, index) => (
              <Col key={index} className="text-center">
                <div className="jeopardy-topic">
                  {topic}
                </div>
              </Col>
            ))}

            {/* Topic questions with enhanced click feedback */}
            {Array.from({ length: 5 }, (_, pointIndex) => (
              <React.Fragment key={pointIndex}>
                {Array.from({ length: 6 }, (_, categoryIndex) => {
                  const selectedIndex = categoryIndex * 5 + pointIndex;
                  const isClickable = (selected || username === selectorUsername) && !isClicked(selectedIndex);
                  return (
                    <Col
                      key={`${categoryIndex}-${pointIndex}`}
                      onClick={() => isClickable && handleSelectedQuestion(selectedIndex)}
                    >
                      <div
                        className={`jeopardy-card prevent-select ${isClicked(selectedIndex) ? 'clicked' : ''} ${isClickable ? 'clickable' : ''}`}
                        style={{
                          backgroundColor: isClicked(selectedIndex) ? 'var(--jeopardy-bg)' : 'var(--jeopardy-bg)',
                          transform: isClicked(selectedIndex) ? 'scale(0.95)' : 'scale(1)',
                          transition: 'all 0.3s ease',
                          cursor: isClickable ? 'pointer' : 'default',
                          opacity: isClicked(selectedIndex) ? 0.7 : 1,
                          border: `2px solid var(--jeopardy-accent)`,
                          color: 'var(--text-light)',
                          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
                        }}
                      >
                        <div className="jeopardy-card-content">
                          {!isClicked(selectedIndex) && (
                            <div className="jeopardy-points">
                              ${jeopardyPoints[pointIndex]}
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </React.Fragment>
            ))}
          </Row>

          <div className="selector-text">
            <strong>{selector}</strong> is choosing the question.
          </div>
        </React.Fragment>
      )}

      {/* Display selected question */}
      {selectedQuestion && (
        <Question
          selectedQuestion={selectedQuestion}
          duration={duration}
          handleNextQuestion={() => handleBackToBoard()}
        />
      )}

    </Container>
  );
};

export default JeopardyBoard;
