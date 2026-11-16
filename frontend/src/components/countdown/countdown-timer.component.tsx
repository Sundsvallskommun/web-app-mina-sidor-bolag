import React, { useEffect, useRef, useState } from 'react';

interface CountdownTimerProps {
  timeout: number; // timeout in milliseconds
  onChangeTime?: (time: number) => void;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ timeout, onChangeTime, className }) => {
  const [deadline] = useState(() => Date.now() + timeout);
  const [timeLeft, setTimeLeft] = useState<number>(timeout);
  const onChangeTimeRef = useRef(onChangeTime);
  useEffect(() => {
    onChangeTimeRef.current = onChangeTime;
  }, [onChangeTime]);

  useEffect(() => {
    // Remaining time is always derived from the fixed deadline, so a throttled or
    // suspended interval catches up on the next tick, and 0 is always reported once.
    const timerId = setInterval(() => {
      const newTime = Math.max(deadline - Date.now(), 0);
      setTimeLeft(newTime);
      onChangeTimeRef.current?.(newTime);
      if (newTime === 0) {
        clearInterval(timerId);
      }
    }, 1000);

    return () => clearInterval(timerId);
  }, [deadline]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return <span className={className}>{formatTime(timeLeft)}</span>;
};

export default CountdownTimer;
