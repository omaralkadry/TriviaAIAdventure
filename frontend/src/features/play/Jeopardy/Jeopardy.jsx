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
      socket.on('next question selector', onSelector);
      socket.on('selected question', onSelectedQuestion);
      socket.on('back to board', onBackToBoard);

      return () => {
        socket.off('next question selector', onSelector);
        socket.off('selected question', onSelectedQuestion);
        socket.off('back to board', onBackToBoard);
      };
    } else {
      console.warn('Jeopardy Board: Socket is not initialized');
    }
  }, [socket]);

  return (
    <Container className="p-4" fluid>
      {/* Display board if not currently in a question */}
      {!selectedQuestion && (
        <React.Fragment>
          <Row xs={6} md={6} className="g-3">

          {/* Topic headers row */}
          {jeopardyTopics.map((topic, index) => (
            <Col key={index} className="text-center">
              <Card 
                className="prevent-select" 
                style={{ minWidth: '80px', minHeight: '100px', padding: '1rem' }}
              >
                <Card.Body className='prevent-select'>
                  <Card.Title className="prevent-select text-center">{topic}</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ))}

          {/* Topic questions with click handlers */}
          {Array.from({ length: 5 }, (_, pointIndex) => (
            <React.Fragment key={pointIndex}>
                {Array.from({ length: 6 }, (_, categoryIndex) => { 
                  const selectedIndex = categoryIndex * 5 + pointIndex;
                  return (
                  <Col 
                    key={`${categoryIndex}-${pointIndex}`} 
                    className="clickable-card" 
                    onClick={() => handleSelectedQuestion(selectedIndex)} 
                  >
                    <Card 
                      className="prevent-select" 
                      style={{ minWidth: '80px', minHeight: '100px', padding: '1rem' }}
                    >
                      <Card.Body className='prevent-select'>
                        { !isClicked(selectedIndex) && (
                          <Card.Title className="prevent-select text-center">
                            {jeopardyPoints[pointIndex]}
                          </Card.Title>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  );
                })}
            </React.Fragment>
          ))}
          </Row>
          
          <a>
            <strong>{selector}</strong> is choosing the question.
          </a>
        </React.Fragment>
      )}

      {/* Display selected question */}
      { selectedQuestion && (
          <>
            <Question 
              selectedQuestion={selectedQuestion} 
              duration={duration}
              handleNextQuestion={() => handleBackToBoard()}
            /> 
          </>
        )
      }
    </Container>
  );
};

export default JeopardyBoard;
