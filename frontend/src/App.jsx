import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HowItWorks from "./pages/HowItWorks";
import IntroAnimation from "./components/IntroAnimation";
// import HowItWorks from "./pages/HowItWorks";

function App() {
  return (
    <>
      <IntroAnimation />

   <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/how-it-works" element={<HowItWorks />} />
    <Route path="/how-it-works" element={<HowItWorks />} />
</Routes>
    </>
  );
}

export default App;