
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/how-it-works.css";

const steps = [
  {
    number: "01",
    icon: "♟",
    title: "CREATE YOUR ACCOUNT",
    description:
      "Sign up or log in to Codyyy. Create your player profile and get ready to enter the coding arena.",
  },
  {
    number: "02",
    icon: "⚔",
    title: "CHOOSE YOUR BATTLE",
    description:
      "Create a private room, join a temporary room, compete in your permanent room or enter the Global Arena.",
  },
  {
    number: "03",
    icon: "◆",
    title: "ENTER THE CHALLENGE",
    description:
      "Every player receives the same coding challenge. Choose your difficulty and prepare for the battle.",
  },
  {
    number: "04",
    icon: "</>",
    title: "CODE AND SUBMIT",
    description:
      "Write your solution in C, Python, Java or JavaScript. Submit your code and test it against 10 test cases.",
  },
  {
    number: "05",
    icon: "★",
    title: "EARN POINTS AND WIN",
    description:
      "Earn points for every test case you pass. Finish at the top to collect additional winning bonuses.",
  },
  {
    number: "06",
    icon: "🏆",
    title: "CLIMB THE LEADERBOARD",
    description:
      "Track your performance, review your match history and compete for the top position.",
  },
];

const roomTypes = [
  {
    icon: "⌂",
    title: "PRIVATE ROOMS",
    description:
      "Create a room and invite 2–6 players using a unique room code.",
    tag: "PLAY WITH FRIENDS",
  },
  {
    icon: "◷",
    title: "TEMPORARY ROOMS",
    description:
      "Start a one-time competition. Match results are saved, but the room closes after the match.",
    tag: "ONE-TIME BATTLE",
  },
  {
    icon: "♜",
    title: "PERMANENT ROOMS",
    description:
      "Build your own coding group with persistent membership, match history and a dedicated leaderboard.",
    tag: "BUILD YOUR COMMUNITY",
  },
  {
    icon: "◎",
    title: "GLOBAL ARENA",
    description:
      "Get matched with available players and compete against developers around the world.",
    tag: "COMPETE WORLDWIDE",
  },
];

function HowItWorks() {
  return (
    <div className="how-page">
      <Navbar />

      {/* HERO SECTION */}
      <section className="how-hero">
        <div className="how-hero-overlay"></div>

        <div className="how-hero-content">
          <p className="how-eyebrow">THE ULTIMATE CODING BATTLE</p>

          <h1>
            HOW IT <span>WORKS.</span>
          </h1>

          <p className="how-hero-description">
            Think you have what it takes? Challenge your friends,
            solve coding problems, earn points and become the
            ultimate Codyyy champion.
          </p>

          <Link to="/register" className="how-main-button">
            ENTER THE ARENA <span>→</span>
          </Link>
        </div>

        <div className="how-scroll-indicator">
          DISCOVER THE BATTLE <span>↓</span>
        </div>
      </section>

      {/* SIX STEPS */}
      <section className="how-steps-section">
        <div className="how-section-heading">
          <p className="how-eyebrow">YOUR JOURNEY STARTS HERE</p>
          <h2>
            SIX STEPS. <span>ONE CHAMPION.</span>
          </h2>
          <p>
            Getting started is simple. Follow these steps and
            enter your first coding battle.
          </p>
        </div>

        <div className="how-steps-grid">
          {steps.map((step) => (
            <div className="how-step-card" key={step.number}>
              <div className="how-step-top">
                <span className="how-step-number">{step.number}</span>
                <span className="how-step-icon">{step.icon}</span>
              </div>

              <h3>{step.title}</h3>
              <p>{step.description}</p>

              <div className="how-card-line"></div>
            </div>
          ))}
        </div>
      </section>

      {/* BATTLE MODES */}
      <section className="how-rooms-section">
        <div className="how-section-heading">
          <p className="how-eyebrow">PICK YOUR PLAYSTYLE</p>
          <h2>
            CHOOSE YOUR <span>BATTLE.</span>
          </h2>
          <p>
            Whether you want to challenge friends or compete
            worldwide, there is a battle waiting for you.
          </p>
        </div>

        <div className="how-rooms-grid">
          {roomTypes.map((room, index) => (
            <div className="how-room-card" key={room.title}>
              <div className="how-room-card-top">
                <span className="how-room-icon">{room.icon}</span>
                <span className="how-room-index">
                  0{index + 1}
                </span>
              </div>

              <span className="how-room-tag">{room.tag}</span>
              <h3>{room.title}</h3>
              <p>{room.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DIFFICULTY AND LANGUAGES */}
      <section className="how-challenge-section">
        <div className="how-section-heading">
          <p className="how-eyebrow">TEST YOUR SKILLS</p>
          <h2>
            EVERY CHALLENGE. <span>A NEW BATTLE.</span>
          </h2>
          <p>
            All players receive the same challenge during a match.
            Choose your approach and solve it before your opponents.
          </p>
        </div>

        <div className="how-difficulty-grid">
          <div className="how-difficulty-card easy">
            <span>LEVEL 01</span>
            <h3>EASY</h3>
            <p>Build your confidence with fundamental problems.</p>
            <strong>10 MINUTES</strong>
          </div>

          <div className="how-difficulty-card medium">
            <span>LEVEL 02</span>
            <h3>MEDIUM</h3>
            <p>Put your problem-solving and logic to the test.</p>
            <strong>15 MINUTES</strong>
          </div>

          <div className="how-difficulty-card hard">
            <span>LEVEL 03</span>
            <h3>HARD</h3>
            <p>Take on advanced challenges and prove your skills.</p>
            <strong>20 MINUTES</strong>
          </div>
        </div>

        <div className="how-languages">
          <p>CHOOSE YOUR WEAPON. CODE IN YOUR LANGUAGE.</p>

          <div className="how-language-list">
            <span>C</span>
            <span>PYTHON</span>
            <span>JAVA</span>
            <span>JAVASCRIPT</span>
          </div>
        </div>
      </section>

      {/* TEST CASES */}
      <section className="how-test-section">
        <div className="how-test-content">
          <p className="how-eyebrow">EVERY TEST COUNTS</p>
          <h2>
            10 TEST CASES. <span>ONE SOLUTION.</span>
          </h2>

          <p className="how-test-description">
            Your submitted code is evaluated against 10 test cases.
            Passing more test cases means earning more points.
          </p>

          <div className="how-test-breakdown">
            <div className="how-test-box visible">
              <span className="how-test-count">03</span>
              <h3>VISIBLE TEST CASES</h3>
              <p>Check your solution with sample inputs and outputs.</p>
              <strong>0.5 POINTS EACH</strong>
            </div>

            <div className="how-test-box hidden">
              <span className="how-test-count">07</span>
              <h3>HIDDEN TEST CASES</h3>
              <p>Test your logic against additional unseen cases.</p>
              <strong>1 POINT EACH</strong>
            </div>
          </div>

          <div className="how-test-note">
            <span>!</span>
            Every player earns test-case points independently,
            regardless of their final match position.
          </div>
        </div>
      </section>

      {/* SCORING SYSTEM */}
      <section className="how-scoring-section">
        <div className="how-section-heading">
          <p className="how-eyebrow">THE MORE YOU SOLVE, THE MORE YOU EARN</p>
          <h2>
            KNOW YOUR <span>POINTS.</span>
          </h2>
          <p>
            Your final score combines coding performance and
            match-position bonuses.
          </p>
        </div>

        <div className="how-scoring-card">
          <div className="how-score-row">
            <span>Each visible test case passed</span>
            <strong>+0.5 PTS</strong>
          </div>

          <div className="how-score-row">
            <span>Each hidden test case passed</span>
            <strong>+1 PT</strong>
          </div>

          <div className="how-score-row winner">
            <span>1st place bonus</span>
            <strong>+20 PTS</strong>
          </div>

          <div className="how-score-row">
            <span>2nd place bonus (3 or more players)</span>
            <strong>+10 PTS</strong>
          </div>

          <div className="how-score-example">
            <p>EXAMPLE SCORE</p>
            <h3>27 <span>POINTS</span></h3>
            <p>
              7 test cases passed (7 points) + 1st place bonus
              (20 points).
            </p>
          </div>
        </div>

        <p className="how-scoring-note">
          In matches with fewer than 3 players, only the winner
          receives the winning bonus. Test-case points are awarded
          independently to every player.
        </p>
      </section>

      {/* LEADERBOARDS */}
      <section className="how-leaderboard-section">
        <div className="how-section-heading">
          <p className="how-eyebrow">YOUR PERFORMANCE. YOUR RANK.</p>
          <h2>
            CLIMB THE <span>RANKINGS.</span>
          </h2>
          <p>
            Every battle brings you one step closer to the top.
          </p>
        </div>

        <div className="how-leaderboard-grid">
          <div className="how-leaderboard-card">
            <span>01</span>
            <h3>ROOM LEADERBOARD</h3>
            <p>Compete with members of your permanent room.</p>
          </div>

          <div className="how-leaderboard-card">
            <span>02</span>
            <h3>GLOBAL LEADERBOARD</h3>
            <p>Compare your overall competitive performance.</p>
          </div>

          <div className="how-leaderboard-card">
            <span>03</span>
            <h3>WEEKLY LEADERBOARD</h3>
            <p>See who earns the most points each week.</p>
          </div>
        </div>
      </section>

      {/* TRAVEL MODE */}
      <section className="how-travel-section">
        <div className="how-travel-content">
          <p className="how-eyebrow">CODE ANYWHERE. PLAY EVERYWHERE.</p>

          <h2>
            INTRODUCING <span>TRAVEL MODE.</span>
          </h2>

          <p>
            Sitting in a cab? Travelling on a bus? Waiting at an
            airport? You don't always need a keyboard to compete.
            Play coding mini-games designed for your phone.
          </p>

          <div className="how-travel-features">
            <div>
              <strong>01</strong>
              <h3>ARRANGE THE CODE</h3>
              <p>Arrange scrambled code blocks in the correct order.</p>
            </div>

            <div>
              <strong>02</strong>
              <h3>LOGIC FLOW</h3>
              <p>Build the solution using visual logic blocks.</p>
            </div>

            <div>
              <strong>03</strong>
              <h3>MATCH THE CODE</h3>
              <p>Match programming concepts with their meanings.</p>
            </div>

            <div>
              <strong>04</strong>
              <h3>SPEED BATTLE</h3>
              <p>Answer five questions faster than your opponent.</p>
            </div>
          </div>

          <span className="how-coming-soon">A NEW WAY TO PLAY CODING.</span>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="how-final-cta">
        <p className="how-eyebrow">YOUR ARENA IS WAITING</p>

        <h2>
          READY TO <span>CODE. BATTLE. WIN?</span>
        </h2>

        <p>
          Create your account, challenge your friends and
          prove that you belong at the top.
        </p>

        <Link to="/register" className="how-main-button">
          START YOUR FIRST BATTLE <span>→</span>
        </Link>
      </section>

      <Footer />
    </div>
  );
}

export default HowItWorks;
