import React, { useState, useEffect } from "react";

function Timer({ durationSeconds, onComplete }) {
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds);

  function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  // Countdown effect
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const intervalId = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeRemaining]);

  // Auto-advance when timer hits zero
  useEffect(() => {
    if (timeRemaining === 0 && onComplete) {
      onComplete();
    }
  }, [timeRemaining, onComplete]);

  return (
    <div className="timer">
      <div className="timer-display">
        {formatTime(timeRemaining)}
      </div>

      <div className="timer-text">
        seconds remaining
      </div>

      {/* 1–3. Manual Next button */}
      <button onClick={onComplete} className="next-button">
        Next
      </button>
    </div>
  );
}

export default Timer;
