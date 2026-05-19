import { createContext, useContext, useEffect, useMemo, useState } from "react";
import authApi from "../api/authApi.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "smartComplaintToken";
const USER_KEY = "smartComplaintUser";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem(USER_KEY);
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));

  const persistSession = (payload) => {
    localStorage.setItem(TOKEN_KEY, payload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const handleLogout = () => clearSession();
    window.addEventListener("smart-complaints:logout", handleLogout);
    return () => window.removeEventListener("smart-complaints:logout", handleLogout);
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await authApi.getProfile();
        if (!ignore) {
          setUser(data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
      } catch {
        if (!ignore) clearSession();
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      ignore = true;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login: async (credentials) => {
        const { data } = await authApi.login(credentials);
        persistSession(data);
        return data.user;
      },
      signup: async (payload) => {
        const { data } = await authApi.signup(payload);
        persistSession(data);
        return data.user;
      },
      logout: clearSession
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
