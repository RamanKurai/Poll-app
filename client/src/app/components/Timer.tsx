"use client";

import { useEffect, useState } from "react";

interface TimerProps {
  onExpire: () => void;
  initialTime?: number;
}

export default function Timer({ onExpire, initialTime = 60 }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  // ✅ Reset timer when initialTime changes
  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(onExpire, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onExpire]);

  return (
    <div className="text-sm text-gray-500 mt-2">Time left: {timeLeft}s</div>
  );
}
