import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';
import './Jeopardy.css';
import Question from './Question.jsx';
import { useSocket } from '../../../services/SocketContext';
import { useAuth } from '../../../services/AuthContext';

const JeopardyBoard = ({ selectorUsername, questions, topics, duration }) => {
  const [gameState, setGameState] = useState(null);
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
  const isClicked = (category, point) => {
    return clickedQuestions.some(
      question => question.category === category && question.point === point
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
    const selectedQuestionObj = jeopardyData[selectedIndex['category'] * 5 + selectedIndex['point']];
    setSelectedQuestion(selectedQuestionObj);
  };

  // Handles clicked question
  const handleSelectedQuestion = (categoryIndex, pointIndex) => {
    let selectedIndex = {};
    selectedIndex['category'] = categoryIndex;
    selectedIndex['point'] = pointIndex;
    console.log(`Selected category: ${selectedIndex['category']}`);
    console.log(`Selected points: ${selectedIndex['point']}`);
    if ((selected || username === selectorUsername) && !isClicked(categoryIndex, pointIndex)) {
      socket.emit('selected question', selectedIndex );
    } else {
      console.log("You are not allowed to select that question right now.");
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
    function onSelectedQuestion(selectedQuestionIndex) {
      setQuestionIndex(selectedQuestionIndex);
      console.log(`Selected category: ${selectedQuestionIndex['category']}`);
      console.log(`Selected points: ${selectedQuestionIndex['point']}`);
      handleClick(selectedQuestionIndex);
      indexToQuestion(selectedQuestionIndex);
    }

    if (socket) {
      socket.on('next question selector', onSelector);
      socket.on('selected question', onSelectedQuestion);

      return () => {
        socket.off('next question selector', onSelector);
        socket.off('selected question', onSelectedQuestion);
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

          {/* Topic headers row */}
          <Row className="g-3 mb-3">
            {jeopardyTopics.map((topic, index) => (
              <Col key={index} className="text-center">
                <Card style={{ minHeight: '100px' }}>
                  <Card.Body>
                    <Card.Title>{topic}</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Topic questions with click handlers */}
          <Row xs={6} md={6} className="g-3">
          {Array.from({ length: 5 }, (_, pointIndex) => (
            <React.Fragment key={pointIndex}>
                {Array.from({ length: 6 }, (_, categoryIndex) => (
                  <Col 
                    key={`${categoryIndex}-${pointIndex}`} 
                    className="clickable-card" 
                    onClick={() => handleSelectedQuestion(categoryIndex, pointIndex)} 
                  >
                    <Card 
                      className="prevent-select" 
                      style={{ minWidth: '80px', minHeight: '100px', padding: '1rem' }}
                    >
                      <Card.Body className='prevent-select'>
                        { !isClicked(categoryIndex, pointIndex) && (
                          <Card.Title className="prevent-select text-center">
                            {jeopardyPoints[pointIndex]}
                          </Card.Title>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
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
            <Question selectedQuestion={selectedQuestion} /> 
            <Button onClick={() => {setSelectedQuestion(null)}}>Exit</Button>
          </>
        )
      }
    </Container>
  );
};

export default JeopardyBoard;
