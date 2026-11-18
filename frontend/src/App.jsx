import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HowItWorks from "./pages/HowItWorks";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import PrivateRoom from "./pages/PrivateRoom";
import PrivateRoomDashboard from "./pages/PrivateRoomDashboard";
import TemporaryRoom from "./pages/TemporaryRoom";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ProfilePage from "./pages/ProfilePage";
import RoomsPage from "./pages/RoomsPage";
import GameStatsPage from "./pages/GameStatsPage";
import Leaderboard from "./pages/Leaderboard";
import GlobalArenaFlow from "./pages/GlobalArenaFlow";

import { AuthProvider } from "./context/authContext";
import ProtectedRoute from "./components/protectedRoute";

// Coding Arena
import CodingArena from "./pages/CodingArena/CodingArena";

import IntroAnimation from "./components/IntroAnimation";

function App() {
  return (
    <AuthProvider>
      <>
        <IntroAnimation />

        <Routes>
          {/* Public pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          {/* Protected pages */}
          <Route element={<ProtectedRoute />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/private-room" element={<PrivateRoom />} />

          {/* Profile page */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Rooms page */}
          <Route path="/Rooms" element={<RoomsPage />} />

          <Route
            path="/private-room-dashboard/:roomId"
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

          {/* Global Arena */}
          <Route path="/global-arena" element={<GlobalArenaFlow />} />

          {/* Coding Arena */}
          <Route path="/arena" element={<CodingArena />} />
        </Routes>
      </>
    </AuthProvider>
  );
}

export default App;