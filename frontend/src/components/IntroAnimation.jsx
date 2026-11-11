
import React, { useEffect, useState } from "react";
import "../styles/intro-animation.css";

function IntroAnimation() {
  const [showIntro, setShowIntro] = useState(
    () => sessionStorage.getItem("codeyyy-intro-played") !== "true"
  );

  const [isClosing, setIsClosing] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (showIntro) {
      sessionStorage.setItem("codeyyy-intro-played", "true");
    }
  }, [showIntro]);

  const closeIntro = () => {
    if (!isClosing) {
      setIsClosing(true);
    }
  };

  const handleAnimationEnd = () => {
    if (isClosing) {
      setShowIntro(false);
    }
  };

  if (!showIntro) return null;

  return (
    <div
      className={`intro-overlay ${isClosing ? "intro-closing" : ""}`}
      onAnimationEnd={handleAnimationEnd}
    >
      {!videoError ? (
        <video
          className="intro-video"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={closeIntro}
          onError={() => setVideoError(true)}
        >
          <source
            src="/videos/codeyyy_video.mp4"
            type="video/mp4"
          />
        </video>
      ) : (
        <div className="intro-error">
          Video could not be loaded.
          <button onClick={closeIntro}>Continue to Codyyy</button>
        </div>
      )}

      {!isClosing && (
        <button
          className="skip-intro"
          onClick={closeIntro}
          type="button"
        >
          SKIP INTRO →
        </button>
      )}
    </div>
  );
}

export default IntroAnimation;
