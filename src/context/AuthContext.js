import React, { createContext, useContext, useState, useEffect } from "react";
import { API_ENDPOINTS, apiCall } from "../config/api";
import {
  isAuthServerAvailable,
  handleFallbackAuth,
  isFallbackMode,
  getFallbackUser,
  apiCallWithFallback,
  showOfflineNotification,
} from "../utils/authFallback";

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
      // Check if we're in fallback mode
      if (isFallbackMode()) {
        const fallbackUser = getFallbackUser();
        if (fallbackUser) {
          setUser(fallbackUser);
          setIsAuthenticated(true);
          setAuthToken(token);
          setIsLoading(false);
          return;
        }
      }

      const response = await apiCallWithFallback(API_ENDPOINTS.VERIFY_TOKEN, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
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

      // Try fallback authentication if server is unavailable
      try {
        const fallbackResult = await handleFallbackAuth("demo");
        if (fallbackResult.success) {
          setUser(fallbackResult.user);
          setIsAuthenticated(true);
          setAuthToken(fallbackResult.token);
        } else {
          logout();
        }
      } catch (fallbackError) {
        console.error("Fallback authentication failed:", fallbackError);
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData) => {
    setUser(userData);
    setIsAuthenticated(true);

    if (userData.token) {
      setAuthToken(userData.token);
      localStorage.setItem("knoux_token", userData.token);

      // Fetch complete user data from /api/user after OAuth login
      try {
        await fetchUserData(userData.token);
      } catch (error) {
        console.error("Failed to fetch user data after login:", error);
      }
    }
  };

  const fetchUserData = async (token = authToken) => {
    if (!token) return;

    try {
      // Check fallback mode first
      if (isFallbackMode()) {
        const fallbackUser = getFallbackUser();
        if (fallbackUser) {
          setUser((prevUser) => ({
            ...prevUser,
            ...fallbackUser,
            provider: prevUser?.provider || fallbackUser.provider,
            authMethod: prevUser?.authMethod || fallbackUser.authMethod,
          }));
          return;
        }
      }

      const response = await apiCallWithFallback(API_ENDPOINTS.GET_USER, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser((prevUser) => ({
          ...prevUser,
          ...userData,
          // Preserve OAuth provider info if it exists
          provider: prevUser?.provider || userData.provider,
          authMethod: prevUser?.authMethod || userData.authMethod,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // In fallback mode, this is not critical
      if (!isFallbackMode()) {
        // Only show error if not in fallback mode
        console.warn("Unable to fetch user data from server");
      }
    }
  };

  const logout = async () => {
    try {
      if (authToken && !isFallbackMode()) {
        await apiCallWithFallback(API_ENDPOINTS.LOGOUT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ token: authToken }),
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
      // Continue with local logout even if server request fails
    } finally {
      // Always clear local state
      setUser(null);
      setIsAuthenticated(false);
      setAuthToken(null);
      localStorage.removeItem("knoux_token");
      localStorage.removeItem("knoux_user"); // Clear fallback user too
    }
  };

  const logoutAllDevices = async () => {
    try {
      if (authToken && !isFallbackMode()) {
        await apiCallWithFallback(API_ENDPOINTS.LOGOUT_ALL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ token: authToken }),
        });
      }
    } catch (error) {
      console.error("Logout all devices failed:", error);
      // Continue with local logout
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
    fetchUserData,

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
