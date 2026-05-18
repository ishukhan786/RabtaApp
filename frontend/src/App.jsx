import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import ChatBox from "./components/ChatBox";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("rabta_token");
    const storedUser = localStorage.getItem("rabta_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("rabta_token");
    localStorage.removeItem("rabta_user");
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={styles.appContainer}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.appName}>💬 RabtaApp</h1>
          {user && (
            <span style={styles.userBadge}>
              Logged in as: <strong>{user.username}</strong>
            </span>
          )}
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout 🚪
        </button>
      </header>

      {/* MAIN CHAT BOX */}
      <ChatBox />
    </div>
  );
}

const styles = {
  appContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#ededed",
    fontFamily: "sans-serif",
  },
  header: {
    height: "60px",
    backgroundColor: "#075e54",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#ffffff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    zIndex: 10,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  appName: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "bold",
    letterSpacing: "0.5px",
  },
  userBadge: {
    fontSize: "14px",
    backgroundColor: "#128c7e",
    padding: "4px 12px",
    borderRadius: "16px",
    border: "1px solid #25d366",
  },
  logoutButton: {
    backgroundColor: "#d32f2f",
    color: "#ffffff",
    padding: "8px 16px",
    borderRadius: "20px",
    border: "none",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};
