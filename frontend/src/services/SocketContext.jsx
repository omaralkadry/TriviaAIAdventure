import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isSocketReady, setSocketReady] = useState(false);

  // New connection to socket.io server
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Update provider state after successful connection
    if (newSocket.connected) {
      setSocketReady(true);
    }

    // Disconnect
    return () => newSocket.disconnect();
  }, []);

  // Verify socket.io client is connected to server
  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        console.log('Connected to socket');
      });
    }
  }, [socket]);

  // Provider for context
  // SocketContext will be used by other components
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  return useContext(SocketContext);
};
