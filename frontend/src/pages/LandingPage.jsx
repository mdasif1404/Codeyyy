
import React from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/landing.css";

function LandingPage() {
  const features = [
    {
      icon: "</>",
      title: "PRACTICE",
      description: "Sharpen your coding skills with curated challenges.",
    },
    {
      icon: "♟",
      title: "COMPETE",
      description: "Battle friends in real-time coding duels.",
    },
    {
      icon: "★",
      title: "CLIMB",
      description: "Earn points, win matches and reach the top.",
    },
  ];

  return (
    <div className="landing-page">

      <Navbar />

      <main>
        <section className="home-hero">

          {/* HERO CONTENT */}
          <div className="hero-content">

            <h2 className="hero-brand">
              CODEYYY <span>.</span>
            </h2>

            <h1 className="hero-title">
              CODE. BATTLE. <span>WIN.</span>
            </h1>

            <div className="hero-underline"></div>

            <p className="hero-description">
              A gaming platform that turns coding into a thrilling
              battle. Solve challenges, compete with friends and level
              up your skills.
            </p>

            {/* HERO BUTTONS */}
            <div className="hero-buttons">

              <Link to="/login" className="pixel-button primary-button">
                <span className="button-icon">⚔</span>
                CREATE A ROOM
              </Link>

              <Link to="/login" className="pixel-button secondary-button">
                <span className="button-icon">▣</span>
                JOIN A BATTLE
              </Link>

            </div>

          </div>

          {/* THREE FEATURE SECTIONS */}
          <div className="hero-features">

            {features.map((feature, index) => (
              <div className="hero-feature" key={index}>

                <div className="feature-icon-box">
                  {feature.icon}
                </div>

                <div className="feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>

              </div>
            ))}

          </div>

        </section>
      </main>

      <Footer />

    </div>
  );
}

export default LandingPage;
