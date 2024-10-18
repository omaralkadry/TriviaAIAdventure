import React, { useState, useEffect, useContext } from 'react';
import { Container, Form, Button, Row, Col, Card, InputGroup } from 'react-bootstrap';
import { useSocket } from '../services/SocketContext';

function Chat() {
  const socket = useSocket();
  const isSocketReady = useSocket();
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  
  // Receive chat messages from socket.io server
  useEffect(() => {
    function onChat(value) {
      setChat((prevMessages) => [...prevMessages, value]);
    }

    // Check if socket.io client is initialized
    if (isSocketReady) {
      socket.on('message', onChat);
    } else {
      //console.warn('Chat on message: Socket is not connected');
    }
  }, [socket]);

  // Send message to socket.io server
  const sendMessage = (message) => {
    // Check if socket.io client is initialized
    if (isSocketReady) {
      socket.emit('message', message);
    } else {
      console.warn('Chat emit message: Socket is not connected');
    }
  };

  // Submitted message check before sending to socket.io server
  // Resets variables for the next submitted message
  const handleSubmit = (event) => {
    event.preventDefault();
    if (message.trim()) {
      //setChat((prevMessages) => [...prevMessages, message]);
      sendMessage(message);
      setMessage('');
    }
  };
  
  return (
    <Container fluid className="py-5">
      <Row className="d-flex justify-content-center">
        <Col md={8} lg={6} xl={4}>
          <Card style={{ borderRadius: "15px", width: '500px' }}>
            <Card.Body>
              {chat.map((message, index) => (
                <Card.Text key={index}>{message}</Card.Text>
              ))}
              <Form.Group>
                <InputGroup>
                  <Form.Control
                    type='text'
                    rows={4}
                    placeholder="Type your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ width: '100%' }}
                  />
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={handleSubmit}
                    style={{ height: 'calc(100% - 20px)', width: '100%' }}
                  >
                    Send
                  </Button>
                </InputGroup>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
export default Chat;
