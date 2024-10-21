import React, { useState } from 'react';
import { Button, Card, Container, Col, Form, Row, Alert } from 'react-bootstrap';
import { useSocket } from '../../services/SocketContext';
import { useNavigate } from 'react-router-dom';

function JoinPage() {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    socket.emit('join room', roomCode, (response) => {
      if (response.success) {
        navigate(`/room?code=${roomCode}`);
      } else {
        setError(response.message || 'Failed to join room');
      }
    });
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className='p-3'>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Enter room code.</Form.Label>
                <Form.Control
                  placeholder="code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                />
              </Form.Group>
              {error && <Alert variant="danger">{error}</Alert>}
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default JoinPage;
