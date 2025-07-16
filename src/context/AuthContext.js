import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  // Check for existing authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("knoux_token");
    if (token) {
      setAuthToken(token);
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch("http://localhost:3001/api/verify-token", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        setAuthToken(token);
      } else {
        // Token is invalid, remove it
        logout();
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);

    if (userData.token) {
      setAuthToken(userData.token);
      localStorage.setItem("knoux_token", userData.token);
    }
  };

  const logout = async () => {
    try {
      if (authToken) {
        await fetch("http://localhost:3001/api/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: authToken }),
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Always clear local state
      setUser(null);
      setIsAuthenticated(false);
      setAuthToken(null);
      localStorage.removeItem("knoux_token");
    }
  };

  const logoutAllDevices = async () => {
    try {
      if (authToken) {
        await fetch("http://localhost:3001/api/logout-all", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: authToken }),
        });
      }
    } catch (error) {
      console.error("Logout all devices failed:", error);
    } finally {
      logout();
    }
  };

  // UI state helpers
  const shouldShowAuthElements = () => {
    return !isAuthenticated;
  };

  const shouldShowDashboardElements = () => {
    return isAuthenticated;
  };

  const getUserDisplayName = () => {
    if (!user) return "مستخدم";
    return user.name || user.email || "مستخدم";
  };

  const getUserAvatar = () => {
    return user?.avatar || null;
  };

  const getUserProvider = () => {
    return user?.provider || "local";
  };

  const value = {
    // Auth state
    user,
    isAuthenticated,
    isLoading,
    authToken,

    // Auth actions
    login,
    logout,
    logoutAllDevices,
    verifyToken,

    // UI helpers
    shouldShowAuthElements,
    shouldShowDashboardElements,
    getUserDisplayName,
    getUserAvatar,
    getUserProvider,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
