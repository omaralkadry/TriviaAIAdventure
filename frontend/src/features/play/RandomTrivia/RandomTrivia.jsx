javascript
import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../../context/SocketContext';
import { Box, Text, Input, Button, VStack, HStack, Heading, useToast } from '@chakra-ui/react';
import './RandomTrivia.css';

const RandomTrivia = ({ roomCode, username, isHost }) => {
  const socket = useSocket();
  const toast = useToast();
  const [questionData, setQuestionData] = useState(null);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentScores, setCurrentScores] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [similarityScore, setSimilarityScore] = useState(null);
  const [timeBonus, setTimeBonus] = useState(null);

  const handleAnswer = useCallback((isCorrect, explanation, similarity, bonus) => {
    setFeedback({
      type: isCorrect ? 'correct' : 'incorrect',
      message: isCorrect ? 'Correct answer!' : 'Incorrect answer!',
      explanation: explanation,
      similarity: similarity,
      timeBonus: bonus
    });
    setExplanation(explanation);
    setSimilarityScore(similarity);
    setTimeBonus(bonus);
    setTimeout(() => setFeedback(null), 5000); // Increased to 5 seconds for readability
  }, []);

  useEffect(() => {
    if (!socket) {
      setError('Connection error. Please try refreshing the page.');
      return;
    }

    socket.on('game_error', (errorMessage) => {
      toast({
        title: 'Game Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
      setError(errorMessage);
    });

    socket.on('question', (data) => {
      setQuestionData({
        id: data.id,
        question: data.question,
        topic: data.topic,
        difficulty: data.difficulty,
        timeLimit: data.timeLimit || 30,
        explanation: data.explanation
      });
      setAnswer('');
      setTimeLeft(data.timeLimit || 30);
      setIsLoading(false);
      setError(null);
    });

    socket.on('scores', (updatedScores) => {
      setCurrentScores(updatedScores);
    });

    socket.on('game_over', () => {
      setGameOver(true);
      setIsLoading(false);
    });

    socket.on('answer_result', (result) => {
      const { correct, explanation, similarity, timeBonus } = result;
      handleAnswer(correct, explanation, similarity, timeBonus);
    });

    socket.on('error', (errorMessage) => {
      setError(errorMessage);
      setIsLoading(false);
    });

    return () => {
      socket.off('question');
      socket.off('scores');
      socket.off('game_over');
      socket.off('answer_result');
      socket.off('error');
      socket.off('game_error');
    };
  }, [socket, handleAnswer, toast]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim() || timeLeft === 0) return;

    try {
      socket.emit('submit_answer', {
        roomCode,
        username,
        answer: answer.trim(),
        questionId: questionData.id
      });
      setAnswer('');
    } catch (err) {
      toast({
        title: 'Error submitting answer',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleNextQuestion = () => {
    if (!isHost) return;
    setIsLoading(true);
    socket.emit('next_question', { roomCode });
  };

  if (error) {
    return (
      <Box className="error">
        <Text>{error}</Text>
        {isHost && <Button onClick={() => window.location.reload()}>Restart Game</Button>}
      </Box>
    );
  }

  if (gameOver) {
    return (
      <VStack className="game-over" spacing={4}>
        <Heading>Game Over!</Heading>
        <Box className="leaderboard">
          <Heading size="md" mb={4}>Final Scores:</Heading>
          {Object.entries(currentScores)
            .sort(([,a], [,b]) => b - a)
            .map(([player, score]) => (
              <HStack key={player} className="score-entry" justify="space-between">
                <Text>{player}</Text>
                <Text fontWeight="bold">{score}</Text>
              </HStack>
            ))}
        </Box>
      </VStack>
    );
  }

  return (
    <VStack className="random-trivia" spacing={4}>
      {isLoading ? (
        <Text className="loading">Loading question...</Text>
      ) : questionData ? (
        <>
          <Box className="question-container">
            <HStack mb={2} justify="space-between" w="100%">
              <Heading size="md">Topic: {questionData.topic}</Heading>
              <Text color={questionData.difficulty === 'easy' ? 'green.500' :
                        questionData.difficulty === 'medium' ? 'orange.500' : 'red.500'}>
                Difficulty: {questionData.difficulty}
              </Text>
            </HStack>
            <Text fontSize="lg" mb={4}>{questionData.question}</Text>
          </Box>
          <Text className={`timer ${timeLeft <= 5 ? 'warning' : ''}`}>
            Time Left: {timeLeft}s
          </Text>
          <form onSubmit={handleSubmit}>
            <HStack>
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value.slice(0, 100))}
                placeholder="Your answer (max 100 characters)"
                maxLength={100}
                disabled={timeLeft === 0}
              />
              <Button type="submit" disabled={timeLeft === 0 || !answer.trim()}>
                Submit
              </Button>
            </HStack>
          </form>
          {feedback && (
            <Box className={`feedback ${feedback.type}`}>
              <Text>{feedback.message}</Text>
              {feedback.explanation && (
                <Text mt={2} fontSize="sm">
                  Explanation: {feedback.explanation}
                </Text>
              )}
              {feedback.similarity && (
                <Text mt={1} fontSize="sm">
                  Answer Similarity: {Math.round(feedback.similarity * 100)}%
                </Text>
              )}
              {feedback.timeBonus && (
                <Text mt={1} fontSize="sm" color="green.500">
                  Time Bonus: {feedback.timeBonus}x
                </Text>
              )}
            </Box>
          )}
          {isHost && timeLeft === 0 && (
            <Button onClick={handleNextQuestion} colorScheme="blue">
              Next Question
            </Button>
          )}
          <Box className="scores" w="100%">
            <Heading size="md" mb={2}>Current Scores:</Heading>
            {Object.entries(currentScores)
              .sort(([,a], [,b]) => b - a)
              .map(([player, score]) => (
                <HStack key={player} className="score-entry" justify="space-between">
                  <Text>{player}</Text>
                  <Text fontWeight="bold">{score}</Text>
                </HStack>
              ))}
          </Box>
        </>
      ) : (
        <Text>Waiting for the first question...</Text>
      )}
    </VStack>
  );
};

export default RandomTrivia;
