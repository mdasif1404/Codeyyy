
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Dashboard() {
  return (
    <>
      <Navbar />

      <main className="info-page">
        <span className="eyebrow">WELCOME TO CODEYYY</span>
        <h1>CHOOSE YOUR BATTLE.</h1>
        <p>Your arena is waiting. What do you want to do?</p>

        <div className="features-grid">
          <div className="feature-card">
            <h2>CREATE A ROOM</h2>
            <p>Start a private coding battle with friends.</p>
            <button className="primary-btn">Coming Soon</button>
          </div>

          <div className="feature-card">
            <h2>JOIN A ROOM</h2>
            <p>Enter a room code and join your friends.</p>
            <button className="primary-btn">Coming Soon</button>
          </div>

          <div className="feature-card">
            <h2>PRACTICE ARENA</h2>
            <p>Practice challenges at your own pace.</p>
            <button className="primary-btn">Coming Soon</button>
          </div>
        </div>

        <Link to="/" className="back-link">Back to homepage</Link>
      </main>

      <Footer />
    </>
  );
}

export default Dashboard;
