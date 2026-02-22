import { createContext, useState, useEffect } from "react";

// Tell Vite's strict linter to ignore this specific line
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Only fetch if a token exists
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Invalid token");
        })
        .then((data) => setUser(data))
        .catch(() => {
          // If token is invalid, clear everything out
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
        });
    }
    // We removed the 'else' block here to keep React happy!
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    // <--- Added setUser right after user! --->
    <AuthContext.Provider value={{ user, setUser, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
