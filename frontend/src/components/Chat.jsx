// Chat.jsx
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, InputGroup } from 'react-bootstrap';
import { useSocket } from '../services/SocketContext';
import { useAuth } from '../services/AuthContext';
import EmojiPicker from './EmojiPicker'; // Import the EmojiPicker component
import './Chat.css'; // Import the CSS file

const colorPalette = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#FF8F33',
  '#8F33FF', '#33FFC1', '#FFBD33', '#FF3333', '#33FF8F'
];

// Helper function to generate a high-contrast color
const getColorForUser = (username, userColorMap) => {
  if (!userColorMap[username]) {
    const index = Object.keys(userColorMap).length % colorPalette.length;
    userColorMap[username] = colorPalette[index];
  }
  return userColorMap[username];
};

function Chat({ roomCode }) {
  const socket = useSocket();
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const { getUsername } = useAuth();
  const username = getUsername();
  const userColorMap = {}; // Object to store user color mappings

  useEffect(() => {
    console.log('Socket connection status:', socket ? 'Connected' : 'Disconnected');

    function onChat(value) {
      console.log('Received message:', value);
      setChat((prevMessages) => [...prevMessages, value]);
    }

    if (socket) {
      setIsSocketReady(true);
      socket.on('connect', () => {
        console.log('Socket connected');
        setIsSocketReady(true);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsSocketReady(false);
      });

      socket.on('message', onChat);

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('message', onChat);
      };
    } else {
      console.warn('Chat: Socket is not initialized');
    }
  }, [socket, roomCode]);

  const sendMessage = (messageContent) => {
    if (isSocketReady && socket) {
      console.log('Sending message:', { username, message: messageContent, roomCode });
      socket.emit('message', { username, message: messageContent, roomCode });
    } else {
      console.warn('Cannot send message: Socket is not connected');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      sendMessage(trimmedMessage);
      setMessage('');
    }
  };

  // Handler for emoji selection
  const handleEmojiSelect = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji);
  };

  return (
      <Container fluid className="py-5">
        <Row className="d-flex justify-content-center">
          <Col md={8} lg={6} xl={4}>
            <Card className="chat-card">
              <Card.Body className="chat-container">
                <div className="chat-messages">
                  {chat.map((msg, index) => {
                    const userColor = getColorForUser(msg.username, userColorMap);
                    return (
                        <Card.Text key={index} className="chat-message" style={{ color: userColor }}>
                          <strong>{msg.username}: </strong>{msg.message}
                        </Card.Text>
                    );
                  })}
                </div>
                <Form onSubmit={handleSubmit} className="message-input-container">
                  <InputGroup>
                    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    <Form.Control
                        type="text"
                        placeholder="Type your message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="form-control"
                    />
                    <Button
                        variant="outline-secondary"
                        type="submit"
                        className="btn"
                    >
                      Send
                    </Button>
                  </InputGroup>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
  );
}

export default Chat;