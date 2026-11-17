import { Link } from "react-router-dom";
import SettingsSidebar from "../components/SettingsSidebar";
import "../styles/settingsLayout.css";
import "../styles/RoomsPage.css";

const RoomsPage = () => {
  return (
    <div className="settings-page">
      {/* Same background video used by Profile */}
      <video
        className="settings-background-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/profile.mp4" type="video/mp4" />
      </video>

      <div className="settings-background-overlay"></div>

      {/* Reuse the existing sidebar */}
      <SettingsSidebar />

      {/* Main content */}
      <main className="settings-main">
        <header className="settings-topbar">
          <span>PLAYER CONTROL CENTER</span>

          <Link to="/dashboard" className="settings-back-button">
            ← BACK TO DASHBOARD
          </Link>
        </header>

        <div className="settings-content">
          <div className="rooms-content-inner">

            {/* Page heading */}
            <div className="rooms-heading">
              <span className="rooms-eyebrow">
                PLAYER CONTROL CENTER / 02
              </span>

              <h1>
                MY ROOMS<span>.</span>
              </h1>

              <p>Every room has a story. Every battle counts.</p>
            </div>

            {/* Rooms Created */}
            <section className="rooms-section">
              <div className="rooms-section-heading">
                <div>
                  <span>YOUR ARENA</span>
                  <h2>ROOMS CREATED</h2>
                  <p>Permanent rooms that you have created.</p>
                </div>

                <span className="rooms-count">00</span>
              </div>

              <div className="rooms-empty">
                <div className="rooms-empty-icon">▣</div>

                <h3>NO ROOMS CREATED YET</h3>

                <p>
                  Your permanent rooms will appear here once you create them.
                </p>

                <Link
                  to="/private-room"
                  className="rooms-create-button"
                >
                  + CREATE A ROOM
                </Link>
              </div>
            </section>

            {/* Rooms Played */}
            <section className="rooms-section">
              <div className="rooms-section-heading">
                <div>
                  <span>BATTLE HISTORY</span>
                  <h2>ROOMS PLAYED</h2>
                  <p>Rooms and battles you have participated in.</p>
                </div>

                <span className="rooms-count">00</span>
              </div>

              <div className="rooms-empty">
                <div className="rooms-empty-icon">⚔</div>

                <h3>NO BATTLES PLAYED YET</h3>

                <p>
                  Your previous matches and joined rooms will appear here.
                </p>
              </div>
            </section>

            <div className="rooms-footer-note">
              ◆ YOUR GAME. YOUR ROOMS. YOUR BATTLES.
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default RoomsPage;
