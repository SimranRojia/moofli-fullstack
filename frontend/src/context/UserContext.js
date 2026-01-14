import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { API_BASE_URL } from '../config';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ streakCount: null, xpCount: null });

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token"); // ✅ new line

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }

        if (storedToken) {
          setToken(storedToken);
        } else {
          setToken(null);
        }
      } catch (error) {
        console.error("Failed to parse user/token from localStorage", error);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
    window.addEventListener("authChange", loadUser);
    return () => window.removeEventListener("authChange", loadUser);
  }, []);

  const userId = user ? user._id : null;

  const refetchStats = useCallback(async () => {
    if (!userId) {
      setStats({ streakCount: 0, xpCount: 0 });
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/api/diary/stats`, { params: { userId } });
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({ streakCount: 0, xpCount: 0 });
    }
  }, [userId]);

  useEffect(() => {
    refetchStats();
  }, [refetchStats]);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // ✅ remove token on logout
    setUser(null);
    setToken(null);
    window.dispatchEvent(new Event("authChange"));
    window.location.href = "/login";
  };

  const value = {
    user,
    token, // ✅ provide token globally
    setUser,
    setToken,
    logout,
    stats,
    refetchStats,
    loading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
