import React, { useState, useEffect } from 'react';
import { ProgressBar } from 'react-bootstrap';
import './Timer.css';
import { useSocket } from '../../services/SocketContext';

const Timer = ({ duration, onCountdownFinish }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const socket = useSocket();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime - 1 <= 0) {
          clearInterval(timer);
          onCountdownFinish();
          return 0;
        } else {
          return prevTime - 1;
        }
      });
    }, 1000);

    const endTimer = () => {
      setTimeLeft(0);
    };

    socket.on('all players answered', endTimer);

    return () => {
      clearInterval(timer) // Cleanup on unmount
      socket.off('all players answered');
    };
  }, [onCountdownFinish, socket]);

  useEffect(() => {
    setTimeLeft(duration);  // Reset the timer when the duration changes
  }, [duration]);

  return (
    /* Referenced
      https://react-bootstrap.netlify.app/docs/components/progress
      https://stackoverflow.com/questions/48886726/why-do-i-get-the-error-expressions-must-have-one-parent-element-how-do-i-fix
    */
    <>
      <div className="timer">
        <span>{timeLeft}s</span>
      </div>
      <ProgressBar now={timeLeft} max={0} min={duration}/>
    </>
  );
};

export default Timer;

