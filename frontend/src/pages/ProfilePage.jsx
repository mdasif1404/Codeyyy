import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfilePage.css";

const avatarOptions = [
  { name: "Cat", image: "/assets/avatar-cat.jpg" },
  { name: "Dog", image: "/assets/avatar-dog.jpg" },
  { name: "Doge", image: "/assets/avatar-doge.jpg" },
  { name: "Duck", image: "/assets/avatar-duck.jpg" },
  { name: "Frog", image: "/assets/avatar-frog.jpg" },
  { name: "Hacker", image: "/assets/avatar-hacker.jpg" },
  { name: "Spiderman", image: "/assets/avatar-spiderman.jpg" },
];

const sidebarItems = [
  { name: "Profile", icon: "◉" },
  { name: "Rooms", icon: "▣", path: "/Rooms" },
  { name: "Game Stats", icon: "▥", path: "/GameStats" },
  { name: "Help & Support", icon: "?" },
];

const ProfilePage = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("Profile");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [editingBio, setEditingBio] = useState(false);

  const [username, setUsername] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.username || user.userName || "player_01";
    } catch {
      return "player_01";
    }
  });

  const [name, setName] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.name || user.fullName || "Codyyy Player";
    } catch {
      return "Codyyy Player";
    }
  });

  const [bio, setBio] = useState(
    localStorage.getItem("profileBio") ||
      "Ready to code, compete and conquer."
  );

  const [selectedAvatar, setSelectedAvatar] = useState(
    localStorage.getItem("profileAvatar") ||
      "/assets/avatar-hacker.jpg"
  );

  const [bioDraft, setBioDraft] = useState(bio);

  const handleAvatarSelect = (image) => {
    setSelectedAvatar(image);
    localStorage.setItem("profileAvatar", image);
    setShowAvatarPicker(false);
  };

  const handleBioSave = () => {
    setBio(bioDraft);
    localStorage.setItem("profileBio", bioDraft);
    setEditingBio(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderSection = () => {
    if (activeSection === "Profile") {
      return (
        <>
          <div className="profile-heading">
            <div>
              <p className="profile-eyebrow">PLAYER SETTINGS / 01</p>
              <h1>MY PROFILE<span>.</span></h1>
              <p className="profile-subtitle">
                Your identity in the Codyyy arena.
              </p>
            </div>

            <div className="profile-player-tag">
              <span className="online-dot"></span>
              PLAYER ACTIVE
            </div>
          </div>

          <section className="profile-main-card">
            <div className="profile-card-label">
              <span>PLAYER IDENTITY</span>
              <span>01 / PROFILE</span>
            </div>

            <div className="profile-identity">
              <div className="profile-avatar-wrapper">
                <img
                  src={selectedAvatar}
                  alt="Player avatar"
                  className="profile-avatar"
                />
                <span className="avatar-online-indicator"></span>
              </div>

              <div className="profile-identity-info">
                <span className="profile-small-label">USERNAME</span>
                <h2>@{username}</h2>
                <p>{name}</p>
              </div>

              <div className="profile-level">
                <span>PLAYER</span>
                <strong>01</strong>
              </div>
            </div>

            <div className="profile-divider"></div>

            <div className="profile-detail-row">
              <div className="profile-detail-heading">
                <div>
                  <span className="profile-small-label">ABOUT ME</span>
                  <h3>PLAYER BIO</h3>
                </div>

                {!editingBio && (
                  <button
                    className="small-edit-button"
                    onClick={() => {
                      setBioDraft(bio);
                      setEditingBio(true);
                    }}
                  >
                    ✎ EDIT
                  </button>
                )}
              </div>

              {editingBio ? (
                <div className="bio-edit-area">
                  <textarea
                    value={bioDraft}
                    onChange={(e) => setBioDraft(e.target.value)}
                    maxLength={160}
                    placeholder="Write something about yourself..."
                  />

                  <div className="bio-edit-actions">
                    <span>{bioDraft.length}/160</span>
                    <button onClick={() => setEditingBio(false)}>
                      CANCEL
                    </button>
                    <button onClick={handleBioSave}>
                      SAVE BIO
                    </button>
                  </div>
                </div>
              ) : (
                <p className="profile-bio">{bio}</p>
              )}
            </div>

            <div className="profile-divider"></div>

            <div className="profile-detail-row avatar-detail-row">
              <div>
                <span className="profile-small-label">CUSTOMIZATION</span>
                <h3>YOUR AVATAR</h3>
                <p className="profile-description">
                  Choose the character that represents you in the arena.
                </p>
              </div>

              <button
                className="change-avatar-button"
                onClick={() => setShowAvatarPicker(true)}
              >
                <span>✦</span> CHANGE AVATAR
              </button>
            </div>
          </section>

          <div className="profile-bottom-note">
            <span>◆</span>
            YOUR GAME. YOUR IDENTITY. YOUR RULES.
          </div>
        </>
      );
    }

    const sectionContent = {
      "Help & Support": {
        eyebrow: "PLAYER SETTINGS / 02",
        title: "HELP & SUPPORT",
        description: "Need help? Find assistance here.",
        message: "Support information will appear here.",
      },
    };

    const content = sectionContent[activeSection];

    return (
      <section className="profile-placeholder">
        <p className="profile-eyebrow">{content.eyebrow}</p>
        <h1>{content.title}<span>.</span></h1>
        <p>{content.description}</p>

        <div className="profile-placeholder-box">
          <span>◆</span>
          <h3>COMING SOON</h3>
          <p>{content.message}</p>
        </div>
      </section>
    );
  };

  return (
    <div className="profile-page">
      {/* BACKGROUND VIDEO */}
      <video
        className="profile-background-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/profile.mp4" type="video/mp4" />
      </video>

      <div className="profile-background-overlay"></div>

      {/* LEFT SETTINGS SIDEBAR */}
      <aside className="profile-sidebar">
        <div className="sidebar-brand">
          <img
            src="/assets/codeyyy-logo.jpg"
            alt="Codyyy"
            className="sidebar-brand-logo"
          />
        </div>

        <p className="sidebar-heading">SETTINGS MENU</p>

        <nav className="sidebar-options">
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              className={`sidebar-option ${
                activeSection === item.name ? "active" : ""
              }`}
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                } else {
                  setActiveSection(item.name);
                  setShowAvatarPicker(false);
                }
              }}
            >
              <span className="sidebar-option-icon">{item.icon}</span>
              <span>{item.name}</span>

              {activeSection === item.name && !item.path && (
                <span className="sidebar-arrow">›</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-player-mini">
            <img src={selectedAvatar} alt="Player" />
            <div>
              <strong>{username}</strong>
              <span>ARENA PLAYER</span>
            </div>
          </div>

          <button className="sidebar-logout" onClick={handleLogout}>
            <span>↪</span>
            LOG OUT
          </button>

          <p className="sidebar-version">CODYyy // VERSION 1.0</p>
        </div>
      </aside>

      {/* RIGHT CONTENT */}
      <section className="profile-content">
        <header className="profile-topbar">
          <span>PLAYER CONTROL CENTER</span>
          <button
            className="profile-back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← BACK TO DASHBOARD
          </button>
        </header>

        <div className="profile-content-inner">
          {renderSection()}
        </div>
      </section>

      {/* AVATAR PICKER */}
      {showAvatarPicker && (
        <div
          className="avatar-modal-backdrop"
          onClick={() => setShowAvatarPicker(false)}
        >
          <div
            className="avatar-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="avatar-modal-header">
              <div>
                <p className="profile-eyebrow">PLAYER CUSTOMIZATION</p>
                <h2>CHOOSE YOUR AVATAR<span>.</span></h2>
                <p>Select your character for the Codyyy arena.</p>
              </div>

              <button
                className="avatar-modal-close"
                onClick={() => setShowAvatarPicker(false)}
              >
                ×
              </button>
            </div>

            <div className="avatar-grid">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar.name}
                  className={`avatar-choice ${
                    selectedAvatar === avatar.image ? "selected" : ""
                  }`}
                  onClick={() => handleAvatarSelect(avatar.image)}
                >
                  <img src={avatar.image} alt={avatar.name} />
                  <span>{avatar.name}</span>

                  {selectedAvatar === avatar.image && (
                    <span className="avatar-selected-mark">✓</span>
                  )}
                </button>
              ))}
            </div>

            <p className="avatar-modal-footer">
              YOUR AVATAR WILL BE SAVED ON THIS DEVICE.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;