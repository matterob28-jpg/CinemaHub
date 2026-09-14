import { createContext, useContext, useState } from "react";
import { login as apiLogin, register as apiRegister } from "../api/client.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "cinemahub_token";
const USER_KEY = "cinemahub_user";

// Session is also saved to localStorage so a page refresh doesn't log the user out
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  // Stores the token and user in both localStorage and component state
  function saveSession(token, userData) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }

  // Logs in through the API and stores the returned session
  async function login(email, password) {
    const { token, user: userData } = await apiLogin({ email, password });
    saveSession(token, userData);
  }

  // Registers a new account through the API and stores the returned session
  async function register(name, email, password) {
    const { token, user: userData } = await apiRegister({ name, email, password });
    saveSession(token, userData);
  }

  // Clears the session from both localStorage and component state
  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Shortcut hook to read the AuthContext value
export function useAuth() {
  return useContext(AuthContext);
}
