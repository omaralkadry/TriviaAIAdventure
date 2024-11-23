import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Row, Col, Card, InputGroup } from 'react-bootstrap';
import { useSocket } from '../services/SocketContext';
import { useAuth } from '../services/AuthContext';

function Chat({ roomCode }) {
  const socket = useSocket();
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const { getUsername } = useAuth();
  const username = getUsername();

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

  return (
    <Container fluid className="py-5">
      <Row className="d-flex">
        <Col md={8} lg={6} xl={4}>
          <Card style={{ borderRadius: "15px", width: '500px', height: '600px', display: 'flex', flexDirection: 'column' }}>
            <Card.Body style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '10px' }}>
                {chat.map((msg, index) => (
                  <Card.Text key={index}>
                    <strong>{msg.username}: </strong>{msg.message}
                  </Card.Text>
                ))}
              </div>
              <Form onSubmit={handleSubmit}>
                <InputGroup>
                  <Form.Control
                    type='text'
                    placeholder="Type your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <Button
                    variant="outline-secondary"
                    type="submit"
                    style={{ height: '38px' }}
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
