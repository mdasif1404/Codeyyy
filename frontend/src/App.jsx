import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HowItWorks from "./pages/HowItWorks";
import Dashboard from "./pages/Dashboard";

import PrivateRoom from "./pages/PrivateRoom";
import PrivateRoomDashboard from "./pages/PrivateRoomDashboard";
import TemporaryRoom from "./pages/TemporaryRoom";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ProfilePage from "./pages/ProfilePage";
import RoomsPage from "./pages/RoomsPage";
import GameStatsPage from "./pages/GameStatsPage";
import Leaderboard from "./pages/Leaderboard";

// Coding Arena
import CodingArena from "./pages/CodingArena/CodingArena";

import IntroAnimation from "./components/IntroAnimation";

function App() {
  return (
    <>
      {/* Website opening animation */}
      <IntroAnimation />

      {/* Website pages */}
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />

        {/* Main dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Profile page */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Rooms page */}
        <Route path="/Rooms" element={<RoomsPage />} />

        {/* Permanent private room */}
        <Route path="/private-room" element={<PrivateRoom />} />

        {/* Private room dashboard */}
        <Route
          path="/private-room-dashboard"
          element={<PrivateRoomDashboard />}
        />

        <Route path="/leaderboard" element={<Leaderboard />} />

        <Route
          path="/private-room-dashboard/:roomCode"
          element={<PrivateRoomDashboard />}
        />

        <Route path="/GameStats" element={<GameStatsPage />} />

        {/* Temporary room */}
        <Route path="/temporary-room" element={<TemporaryRoom />} />

        {/* Coding Arena */}
        <Route path="/arena" element={<CodingArena />} />

        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Routes>
    </>
  );
}

export default App;