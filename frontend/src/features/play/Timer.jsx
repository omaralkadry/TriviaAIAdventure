import React, { useState, useEffect } from 'react';
import './Timer.css';

const Timer = ({ duration, onCountdownFinish }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

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

    return () => clearInterval(timer);  // Cleanup on unmount
  }, [onCountdownFinish]);

  useEffect(() => {
    setTimeLeft(duration);  // Reset the timer when the duration changes
  }, [duration]);

  return (
      <div className="timer">
        <span>{timeLeft}s</span>
      </div>
  );
};

export default Timer;

