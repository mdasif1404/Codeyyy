
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
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
  { name: "Rooms", icon: "▣" },
  { name: "Game Stats", icon: "▥" },
  { name: "Help & Support", icon: "?" },
];

const DEFAULT_AVATAR = "/assets/avatar-hacker.jpg";

const ProfilePage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [activeSection, setActiveSection] = useState("Profile");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [roomActionLoading, setRoomActionLoading] = useState("");

  // PLAYER STATS
  const [playerStats, setPlayerStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  // ROOMS DATA
  const [roomsData, setRoomsData] = useState({
    permanentRooms: [],
    temporaryRooms: [],
    summary: {},
  });
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState("");

  // FETCH LOGGED-IN USER PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setProfileError("");

        const response = await api.get("/auth/me");

        setUser(response.data.user);
        setBioDraft(response.data.user.bio || "");
      } catch (error) {
        console.error("Profile fetch error:", error);

        if (error.response?.status === 401) {
          navigate("/login");
          return;
        }

        setProfileError(
          error.response?.data?.message ||
          "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // FETCH ROOMS WHEN ROOMS SECTION IS OPENED
  useEffect(() => {
    if (activeSection !== "Rooms") return;

    const fetchRooms = async () => {
      try {
        setRoomsLoading(true);
        setRoomsError("");

        const response = await api.get("/rooms/my-rooms");

        setRoomsData({
          permanentRooms: response.data.data?.permanentRooms || [],
          temporaryRooms: response.data.data?.temporaryRooms || [],
          summary: response.data.data?.summary || {},
        });
      } catch (error) {
        console.error("Fetch rooms error:", error);

        if (error.response?.status === 401) {
          navigate("/login");
          return;
        }

        setRoomsError(
          error.response?.data?.message ||
          "Unable to retrieve your rooms."
        );
      } finally {
        setRoomsLoading(false);
      }
    };

    fetchRooms();
  }, [activeSection, navigate]);

  // FETCH PLAYER STATS
  useEffect(() => {
    if (activeSection !== "Game Stats") return;

    const fetchPlayerStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError("");

        const response = await api.get("/stats/me");

        setPlayerStats(response.data.data);

      } catch (error) {
        console.error("Fetch player stats error:", error);

        if (error.response?.status === 401) {
          navigate("/login");
          return;
        }

        setStatsError(
          error.response?.data?.message ||
          "Unable to retrieve player statistics."
        );
      } finally {
        setStatsLoading(false);
      }
    };

    fetchPlayerStats();
  }, [activeSection, navigate]);

  const selectedAvatar = user?.avatar || DEFAULT_AVATAR;

  // UPDATE AVATAR
  const handleAvatarSelect = async (image) => {
    try {
      const response = await api.put("/auth/profile", {
        avatar: image,
      });

      setUser(response.data.user);
      setShowAvatarPicker(false);
    } catch (error) {
      console.error("Avatar update error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to update avatar."
      );
    }
  };

  // UPDATE BIO
  const handleBioSave = async () => {
    try {
      const response = await api.put("/auth/profile", {
        bio: bioDraft,
      });

      setUser(response.data.user);
      setEditingBio(false);
    } catch (error) {
      console.error("Bio update error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to update bio."
      );
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // OPEN SELECTED ROOM
  const handleOpenRoom = (item) => {
    const room = item.room;

    if (room.roomType === "permanent") {
      navigate(`/private-room-dashboard/${room._id}`);
    } else {
      navigate("/temporary-room", {
        state: { roomId: room._id },
      });
    }
  };

  // LEAVE OR CLOSE SELECTED ROOM
  const handleLeaveRoom = async (item) => {
    const room = item.room;
    const isOwner = item.role === "owner";
    const isTemporary = room.roomType === "temporary";

    const actionText =
      isTemporary && isOwner ? "close this temporary room" : "leave this room";

    if (!window.confirm(`Are you sure you want to ${actionText}?`)) {
      return;
    }

    try {
      setRoomActionLoading(room._id);

      if (isTemporary) {
        await api.post(`/rooms/temporary/${room._id}/leave`);
      } else {
        await api.post(`/rooms/${room._id}/leave`);
      }

      // Refresh room list after successful action
      const response = await api.get("/rooms/my-rooms");

      setRoomsData({
        permanentRooms: response.data.data?.permanentRooms || [],
        temporaryRooms: response.data.data?.temporaryRooms || [],
        summary: response.data.data?.summary || {},
      });

      alert(
        isTemporary && isOwner
          ? "Temporary room closed successfully."
          : "You left the room successfully."
      );

    } catch (error) {
      console.error("Room action failed:", error);

      alert(
        error.response?.data?.message ||
        "Unable to complete this action."
      );
    } finally {
      setRoomActionLoading("");
    }
  };

  // ROOM CARD
  const renderRoomCard = (item, type) => {
    const room = item.room;

    const isActive = item.membershipStatus === "active";
    const isOwner = item.role === "owner";

    return (
      <article
        key={item.membershipId}
        className="profile-room-card"
        style={{
          padding: "20px",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.04)",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span className="profile-small-label">
              {type === "permanent"
                ? "PERMANENT ROOM"
                : "TEMPORARY ROOM"}
            </span>

            <h3 style={{ margin: "8px 0" }}>
              {room.roomName}
            </h3>

            <p className="profile-description">
              Room code: <strong>{room.roomCode}</strong>
            </p>
          </div>

          <span
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "11px",
              background: isActive
                ? "rgba(46,204,113,0.15)"
                : "rgba(255,255,255,0.1)",
              color: isActive ? "#62e6a0" : "#aaa",
            }}
          >
            {isActive ? "ACTIVE MEMBER" : "LEFT ROOM"}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          <div>
            <span className="profile-small-label">YOUR ROLE</span>
            <p>{isOwner ? "Owner" : "Member"}</p>
          </div>

          <div>
            <span className="profile-small-label">DIFFICULTY</span>
            <p>{room.difficulty || "Not set"}</p>
          </div>

          <div>
            <span className="profile-small-label">MATCH STATUS</span>
            <p>{room.matchStatus || "Waiting"}</p>
          </div>

          <div>
            <span className="profile-small-label">TOTAL MATCHES</span>
            <p>{room.totalMatches ?? 0}</p>
          </div>

          <div>
            <span className="profile-small-label">JOINED ON</span>
            <p>{formatDate(item.joinedAt)}</p>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "20px",
          }}
        >
          <button
            type="button"
            className="change-avatar-button"
            onClick={() => handleOpenRoom(item)}
            disabled={!isActive}
          >
            OPEN ROOM →
          </button>
        
          {!(type === "permanent" && isOwner) && (
            <button
              type="button"
              className="leave-room-button"
              onClick={() => handleLeaveRoom(item)}
              disabled={roomActionLoading === room._id}
            >
              {roomActionLoading === room._id
                ? "PLEASE WAIT..."
                : type === "temporary" && isOwner
                  ? "CLOSE ROOM"
                  : "LEAVE ROOM"}
            </button>
          )}
        </div>
      </article>
    );
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="profile-page">
        <p>Loading your profile...</p>
      </div>
    );
  }

  // ERROR STATE
  if (profileError || !user) {
    return (
      <div className="profile-page">
        <p>{profileError || "Profile not found."}</p>
      </div>
    );
  }

  // PAGE SECTIONS
  const renderSection = () => {
    if (activeSection === "Profile") {
      return (
        <>
          <div className="profile-heading">
            <div>
              <p className="profile-eyebrow">
                PLAYER SETTINGS / 01
              </p>

              <h1>
                MY PROFILE<span>.</span>
              </h1>

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
                <span className="profile-small-label">
                  USERNAME
                </span>

                <h2>@{user.username}</h2>

                <p>{user.email}</p>
              </div>

              <div className="profile-level">
                <span>RATING</span>
                <strong>
                  {user.stats?.rating ?? 1000}
                </strong>
              </div>
            </div>

            <div className="profile-divider"></div>

            <div className="profile-detail-row">
              <div className="profile-detail-heading">
                <div>
                  <span className="profile-small-label">
                    ABOUT ME
                  </span>

                  <h3>PLAYER BIO</h3>
                </div>

                {!editingBio && (
                  <button
                    className="small-edit-button"
                    onClick={() => {
                      setBioDraft(user.bio || "");
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

                    <button
                      onClick={() => {
                        setBioDraft(user.bio || "");
                        setEditingBio(false);
                      }}
                    >
                      CANCEL
                    </button>

                    <button onClick={handleBioSave}>
                      SAVE BIO
                    </button>
                  </div>
                </div>
              ) : (
                <p className="profile-bio">
                  {user.bio || "No bio added yet."}
                </p>
              )}
            </div>

            <div className="profile-divider"></div>

            <div className="profile-detail-row avatar-detail-row">
              <div>
                <span className="profile-small-label">
                  CUSTOMIZATION
                </span>

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

    // ROOMS SECTION
    if (activeSection === "Rooms") {
      const {
        permanentRooms,
        temporaryRooms,
        summary,
      } = roomsData;

      return (
        <>
          <div className="profile-heading">
            <div>
              <p className="profile-eyebrow">
                PLAYER SETTINGS / 02
              </p>

              <h1>
                MY ROOMS<span>.</span>
              </h1>

              <p className="profile-subtitle">
                Your permanent and temporary Codyyy rooms.
              </p>
            </div>

            <button
              className="small-edit-button"
              onClick={() => {
                setActiveSection("Rooms");
              }}
            >
              ↻ REFRESH
            </button>
          </div>

          {roomsLoading ? (
            <section className="profile-main-card">
              <p>Loading your rooms...</p>
            </section>
          ) : roomsError ? (
            <section className="profile-main-card">
              <p>{roomsError}</p>
            </section>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                  gap: "14px",
                  marginBottom: "25px",
                }}
              >
                {[
                  {
                    label: "TOTAL ROOMS",
                    value: summary.totalRooms ?? 0,
                  },
                  {
                    label: "PERMANENT",
                    value: summary.permanentRooms ?? 0,
                  },
                  {
                    label: "TEMPORARY",
                    value: summary.temporaryRooms ?? 0,
                  },
                  {
                    label: "ACTIVE MEMBERSHIPS",
                    value: summary.activeMemberships ?? 0,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="profile-main-card"
                    style={{ padding: "18px" }}
                  >
                    <span className="profile-small-label">
                      {stat.label}
                    </span>
                    <h2 style={{ marginTop: "10px" }}>
                      {stat.value}
                    </h2>
                  </div>
                ))}
              </div>

              <section className="profile-main-card">
                <div className="profile-card-label">
                  <span>PERMANENT ROOMS</span>
                  <span>{permanentRooms.length} ROOMS</span>
                </div>

                {permanentRooms.length > 0 ? (
                  <div style={{ marginTop: "20px" }}>
                    {permanentRooms.map((item) =>
                      renderRoomCard(item, "permanent")
                    )}
                  </div>
                ) : (
                  <p className="profile-description">
                    You haven't created or joined any permanent rooms yet.
                  </p>
                )}
              </section>

              <section
                className="profile-main-card"
                style={{ marginTop: "20px" }}
              >
                <div className="profile-card-label">
                  <span>TEMPORARY ROOMS</span>
                  <span>{temporaryRooms.length} ROOMS</span>
                </div>

                {temporaryRooms.length > 0 ? (
                  <div style={{ marginTop: "20px" }}>
                    {temporaryRooms.map((item) =>
                      renderRoomCard(item, "temporary")
                    )}
                  </div>
                ) : (
                  <p className="profile-description">
                    You are not currently associated with any temporary rooms.
                  </p>
                )}
              </section>

              <div className="profile-bottom-note">
                <span>◆</span>
                YOUR ROOMS. YOUR TEAM. YOUR BATTLES.
              </div>
            </>
          )}
        </>
      );
    }


    // GAME STATS SECTION
    if (activeSection === "Game Stats") {
      const stats = playerStats;
    
      const statCards = [
        { label: "TOTAL MATCHES", value: stats?.totalMatches ?? 0 },
        { label: "VICTORIES", value: stats?.wins ?? 0 },
        { label: "DEFEATS", value: stats?.losses ?? 0 },
        { label: "WIN RATE", value: `${stats?.winRate ?? 0}%` },
        { label: "TOTAL POINTS", value: stats?.totalPoints ?? 0 },
        { label: "PLAYER RATING", value: stats?.rating ?? 1000 }
      ];
    
      return (
        <>
          <div className="profile-heading">
            <div>
              <p className="profile-eyebrow">
                PLAYER SETTINGS / 03
              </p>
      
              <h1>
                GAME STATS<span>.</span>
              </h1>
      
              <p className="profile-subtitle">
                Your permanent competitive performance in Codyyy.
              </p>
            </div>
          </div>
      
          {statsLoading ? (
            <section className="profile-main-card">
              <p>Loading your player statistics...</p>
            </section>
          ) : statsError ? (
            <section className="profile-main-card">
              <p>{statsError}</p>
            </section>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "16px",
                  marginBottom: "25px"
                }}
              >
                {statCards.map(stat => (
                  <div
                    key={stat.label}
                    className="profile-main-card"
                    style={{ padding: "20px" }}
                  >
                    <span className="profile-small-label">
                      {stat.label}
                    </span>
                
                    <h2 style={{ marginTop: "12px" }}>
                      {stat.value}
                    </h2>
                  </div>
                ))}
              </div>
              
              <section className="profile-main-card">
                <div className="profile-card-label">
                  <span>RECENT MATCH HISTORY</span>
                  <span>
                    {stats?.recentMatches?.length ?? 0} MATCHES
                  </span>
                </div>
              
                {!stats?.recentMatches?.length ? (
                  <p className="profile-description">
                    You haven't completed any permanent-room matches yet.
                  </p>
                ) : (
                  <div style={{ marginTop: "20px" }}>
                    {stats.recentMatches.map(match => (
                      <article
                        key={match.matchId}
                        style={{
                          padding: "16px",
                          marginBottom: "12px",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: "10px",
                          background: "rgba(255,255,255,0.04)"
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "12px",
                            flexWrap: "wrap"
                          }}
                        >
                          <div>
                            <h3>{match.roomName}</h3>
                        
                            <p className="profile-description">
                              Room code: {match.roomCode}
                            </p>
                        
                            <p className="profile-description">
                              Opponent(s): {match.opponents.join(", ") || "None"}
                            </p>
                          </div>
                        
                          <strong
                            style={{
                              color: match.result === "Won"
                                ? "#62e6a0"
                                : "#ff8585"
                            }}
                          >
                            {match.result.toUpperCase()}
                          </strong>
                        </div>
                          
                        <div
                          style={{
                            display: "flex",
                            gap: "24px",
                            flexWrap: "wrap",
                            marginTop: "12px"
                          }}
                        >
                          <span>Score: {match.score}</span>
                          <span>Rank: {match.rank ?? "N/A"}</span>
                          <span>
                            {formatDate(match.completedAt)}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
              
              <div className="profile-bottom-note">
                <span>◆</span>
                EVERY MATCH COUNTS. EVERY VICTORY MATTERS.
              </div>
            </>
          )}
        </>
      );
    }


    const sectionContent = {
      "Help & Support": {
        eyebrow: "PLAYER SETTINGS / 04",
        title: "HELP & SUPPORT",
        description: "Need help? Find assistance here.",
        message: "Support information will appear here.",
      },
    };

    const content = sectionContent[activeSection];

    return (
      <section className="profile-placeholder">
        <p className="profile-eyebrow">
          {content.eyebrow}
        </p>

        <h1>
          {content.title}<span>.</span>
        </h1>

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
        <source
          src="/videos/profile.mp4"
          type="video/mp4"
        />
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

        <p className="sidebar-heading">
          SETTINGS MENU
        </p>

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
              <span className="sidebar-option-icon">
                {item.icon}
              </span>

              <span>{item.name}</span>

              {activeSection === item.name && (
                <span className="sidebar-arrow">›</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-player-mini">
            <img
              src={selectedAvatar}
              alt="Player"
            />

            <div>
              <strong>{user.username}</strong>
              <span>ARENA PLAYER</span>
            </div>
          </div>

          <button
            className="sidebar-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            LOG OUT
          </button>

          <p className="sidebar-version">
            CODYyy // VERSION 1.0
          </p>
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
                <p className="profile-eyebrow">
                  PLAYER CUSTOMIZATION
                </p>

                <h2>
                  CHOOSE YOUR AVATAR<span>.</span>
                </h2>

                <p>
                  Select your character for the Codyyy arena.
                </p>
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
                  <img
                    src={avatar.image}
                    alt={avatar.name}
                  />

                  <span>{avatar.name}</span>

                  {selectedAvatar === avatar.image && (
                    <span className="avatar-selected-mark">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>

            <p className="avatar-modal-footer">
              YOUR AVATAR IS SAVED TO YOUR ACCOUNT.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
