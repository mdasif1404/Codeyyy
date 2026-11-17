
import React, { useEffect, useState } from "react";
import "../styles/pomodoro.css";

const Pomodoro = ({
  isRunning = false,
  durationMinutes = 25,
  onComplete
}) => {
  const totalSeconds = durationMinutes * 60;

  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
    setIsDone(false);
  }, [totalSeconds]);

  useEffect(() => {
    if (!isRunning || isDone) return;

    const interval = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          clearInterval(interval);
          setIsDone(true);
          onComplete?.();
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isDone, onComplete]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const formattedTime =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progress = (totalSeconds - secondsLeft) / totalSeconds;

  const rotation = progress * 360;

  const urgent = secondsLeft <= 10 && secondsLeft > 0;

  return (
    <div className={`pomodoro-widget ${urgent ? "is-urgent" : ""} ${isDone ? "is-done" : ""}`}>

      <span className="pomodoro-caption">
        {isDone ? "SESSION COMPLETE" : "FOCUS SESSION"}
      </span>

      <div className="pomodoro">

        {/* TOMATO TIMER */}
        <div className="pomodoro__art">

          <svg
            viewBox="0 0 150 150"
            role="img"
            aria-label="Rotating tomato Pomodoro timer"
          >

            <defs>
              <linearGradient id="tomatoBody" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff7770" />
                <stop offset="48%" stopColor="#ef2929" />
                <stop offset="100%" stopColor="#a40e1a" />
              </linearGradient>

              <linearGradient id="tomatoBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b91622" />
                <stop offset="100%" stopColor="#6f0712" />
              </linearGradient>

              <clipPath id="tomatoClip">
                <ellipse cx="75" cy="82" rx="54" ry="53" />
              </clipPath>
            </defs>

            {/* FIXED LOWER TOMATO BODY */}
            <ellipse
              cx="75"
              cy="82"
              rx="54"
              ry="53"
              fill="url(#tomatoBody)"
              stroke="#8e111b"
              strokeWidth="2"
            />

            {/* FIXED TIMER SCALE BAND */}
            <g>
              <path
                d="M22 82 Q75 105 128 82 L127 101 Q75 126 23 101Z"
                fill="url(#tomatoBand)"
                stroke="#79101a"
                strokeWidth="1.5"
              />

              {/* Scale ticks */}
              {Array.from({ length: 21 }, (_, i) => {
                const x = 29 + i * 4.6;
                return (
                  <line
                    key={i}
                    x1={x}
                    y1={87 + Math.sin(i / 20 * Math.PI) * 2}
                    x2={x}
                    y2={i % 5 === 0 ? 99 : 95}
                    stroke="#fff0d0"
                    strokeWidth="1.5"
                  />
                );
              })}

              <g fill="#fff3d8" fontSize="8" fontWeight="bold" textAnchor="middle">
                <text x="40" y="108">5</text>
                <text x="75" y="116">0</text>
                <text x="110" y="108">55</text>
              </g>

              {/* Fixed pointer */}
              <path d="M75 119 L68 130 L82 130Z" fill="#fff3d8" />
            </g>

            {/* ROTATING UPPER TOMATO DOME + STEM + LEAVES */}
            <g
              className="tomato-rotating-top"
              style={{
                transform: `rotateY(${rotation}deg)`,
                transformOrigin: "75px 65px",
                transformBox: "view-box"
              }}
            >

              {/* Upper dome */}
              <path
                d="M21 82 C21 47 42 29 75 29 C108 29 129 47 129 82 Q75 102 21 82Z"
                fill="url(#tomatoBody)"
                stroke="#8e111b"
                strokeWidth="2"
              />

              {/* Tomato shine */}
              <ellipse
                cx="45"
                cy="48"
                rx="11"
                ry="5"
                fill="#ffd9c9"
                opacity=".65"
                transform="rotate(-35 45 48)"
              />

              <path
                d="M34 65 Q45 42 63 40"
                fill="none"
                stroke="#ff9990"
                strokeWidth="2"
                opacity=".45"
              />

              {/* Stem */}
              <path
                d="M75 37 Q70 19 75 10 Q81 19 75 37Z"
                fill="#18863c"
                stroke="#075e2a"
                strokeWidth="1.5"
              />

              {/* Leaves */}
              <g fill="#32a852" stroke="#126b32" strokeWidth="1.5">
                <path d="M75 38 Q43 13 27 27 Q51 29 75 43Z" />
                <path d="M75 38 Q107 13 123 27 Q99 29 75 43Z" />
                <path d="M75 38 Q61 10 75 7 Q89 10 75 38Z" />
                <path d="M75 39 Q54 52 49 43 Q64 34 75 39Z" />
                <path d="M75 39 Q96 52 101 43 Q86 34 75 39Z" />
              </g>

            </g>

          </svg>
        </div>

        {/* DIGITAL TIMER */}
        <div className="pomodoro__time">
          {formattedTime}
        </div>

      </div>

      <span className="pomodoro-status">
        {isDone
          ? "TIME'S UP!"
          : isRunning
            ? "STAY FOCUSED"
            : "WAITING TO START"}
      </span>

    </div>
  );
};

export default Pomodoro;
