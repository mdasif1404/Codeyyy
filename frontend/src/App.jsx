
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

        {/* Permanent private room */}
        <Route path="/private-room" element={<PrivateRoom />} />

        {/* Private room dashboard */}
        <Route
          path="/private-room-dashboard"
          element={<PrivateRoomDashboard />}
        />

        <Route
          path="/private-room-dashboard/:roomCode"
          element={<PrivateRoomDashboard />}
        />

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
