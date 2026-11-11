
import { useEffect, useRef, useState } from "react";
import "../styles/intro-animation.css";

function IntroAnimation() {
  const [showIntro, setShowIntro] = useState(() => {
    return sessionStorage.getItem("codyyy_intro_played") !== "true";
  });

  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!showIntro) return;

    document.body.style.overflow = "hidden";

    const video = videoRef.current;

    if (video) {
      video.muted = true;

      video.play().catch((error) => {
        console.error("Intro autoplay failed:", error);
      });
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showIntro]);

  const finishIntro = () => {
    sessionStorage.setItem("codyyy_intro_played", "true");
    setShowIntro(false);
  };

  if (!showIntro) return null;

  return (
    <div className="intro-overlay">

      {!videoError ? (
        <video
          ref={videoRef}
          className="intro-video"
          src="/videos/codeyyy_video.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={finishIntro}
          onError={() => {
            console.error("Unable to load intro video.");
            setVideoError(true);
          }}
        />
      ) : (
        <div className="intro-fallback">
          <h1>CODYEYY</h1>
          <p>THE CODING BATTLE</p>
        </div>
      )}

      <div className="intro-dark-overlay" />

      <button
        className="skip-intro-btn"
        onClick={finishIntro}
      >
        SKIP INTRO →
      </button>

    </div>
  );
}

export default IntroAnimation;
