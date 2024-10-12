import io from 'socket.io-client';
import React, { useState, useEffect } from 'react';

const SOCKET_URL = 'http://localhost:3000';

const socket = io(SOCKET_URL);

function SocketManager() {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');

  // Connection to socket.io server
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  // Recieved messages for chat
  useEffect(() => {
    function onChat(value) {
      setChat((prevMessages) => [...prevMessages, value]);
    }

    socket.on('message', onChat);

    return () => {
      socket.off('message', onChat);
    };
  }, []);

  // Send message to socket.io server
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
        socket.emit('message', message);
        setMessage('');
    }
  };
}