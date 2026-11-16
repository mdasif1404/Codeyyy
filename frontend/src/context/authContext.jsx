
import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check whether the user has an active session
  const checkAuth = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user || response.data.data?.user || null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Login
  const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);

      setUser(response.data.user);

      return response.data;
  };

  // Register
  const register = async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  };

  // Verify email using OTP
const verifyEmail = async (verificationData) => {
  const response = await api.post(
    "/auth/verify-email",
    verificationData
  );

  if (response.data.success && response.data.user) {
    setUser(response.data.user);
  }

  return response.data;
};

// Resend verification OTP
const resendOTP = async (email) => {
  const response = await api.post(
    "/auth/resend-otp",
    { email }
  );

  return response.data;
};

  // Logout
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
        value={{
          user,
          setUser,
          loading,
          login,
          register,
          verifyEmail,
          resendOTP,
          logout,
          checkAuth,
          isAuthenticated: !!user
        }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};
