import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import ChatBox from "./components/ChatBox";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("rabta_token");
    const storedUser = localStorage.getItem("rabta_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditName(parsedUser.name || "");
      setEditBio(parsedUser.bio || "Hey there! I am using RaabtaApp.");
      setEditAvatar(parsedUser.avatar || "");
    }
  }, []);

  const handleLoginSuccess = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    setEditName(userData.name || "");
    setEditBio(userData.bio || "Hey there! I am using RaabtaApp.");
    setEditAvatar(userData.avatar || "");
  };

  const handleLogout = () => {
    localStorage.removeItem("rabta_token");
    localStorage.removeItem("rabta_user");
    setToken(null);
    setUser(null);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: editName.trim(),
          bio: editBio.trim(),
          avatar: editAvatar.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update profile");
      setUser(data);
      localStorage.setItem("rabta_user", JSON.stringify(data));
      setMessage("✅ Profile updated successfully!");
      setTimeout(() => {
        setMessage("");
        setShowProfileModal(false);
      }, 1500);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
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
              {user.avatar || "👤"} <strong>{user.name || user.username}</strong>
            </span>
          )}
        </div>
        <div style={styles.headerRight}>
          <button onClick={() => setShowProfileModal(true)} style={styles.profileButton}>
            ⚙️ Profile Settings
          </button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout 🚪
          </button>
        </div>
      </header>

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>⚙️ Profile Settings</h2>
              <button onClick={() => setShowProfileModal(false)} style={styles.closeButton}>✕</button>
            </div>
            <form onSubmit={handleSaveProfile} style={styles.modalForm}>
              {message && (
                <div style={{ padding: "10px", borderRadius: "6px", backgroundColor: message.startsWith("✅") ? "#dcf8c6" : "#ffebee", color: message.startsWith("✅") ? "#075e54" : "#c62828", fontSize: "14px", textAlign: "center", fontWeight: "500" }}>
                  {message}
                </div>
              )}
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Choose Avatar Icon</label>
                <div style={styles.avatarPicker}>
                  {["👨‍💻", "🚀", "🎨", "🌟", "🔥", "👑", "🍕", "🎸", "💡", "⚽"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditAvatar(emoji)}
                      style={{ ...styles.emojiBtn, border: editAvatar === emoji ? "2px solid #075e54" : "1px solid #ddd", backgroundColor: editAvatar === emoji ? "#e8f5e9" : "#fff" }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="e.g. Ishtiaq Khan" style={styles.input} />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Bio / Status Message</label>
                <input type="text" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="e.g. Available, Busy, At work..." style={styles.input} />
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowProfileModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={saving} style={styles.saveBtn}>{saving ? "Saving..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
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
    padding: "6px 14px",
    borderRadius: "20px",
    border: "1px solid #25d366",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  profileButton: {
    backgroundColor: "#128c7e",
    color: "#ffffff",
    padding: "8px 16px",
    borderRadius: "20px",
    border: "1px solid #25d366",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s",
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
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "450px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  modalHeader: {
    backgroundColor: "#075e54",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#ffffff",
  },
  modalTitle: { margin: 0, fontSize: "20px", fontWeight: "bold" },
  closeButton: { background: "none", border: "none", color: "#ffffff", fontSize: "20px", cursor: "pointer", padding: 0 },
  modalForm: { padding: "24px", display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "14px", fontWeight: "600", color: "#333333" },
  input: { padding: "12px 16px", borderRadius: "8px", border: "1px solid #cccccc", fontSize: "15px", outline: "none" },
  avatarPicker: { display: "flex", flexWrap: "wrap", gap: "10px", padding: "8px 0" },
  emojiBtn: { width: "42px", height: "42px", borderRadius: "8px", fontSize: "22px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" },
  cancelBtn: { padding: "10px 20px", borderRadius: "8px", border: "1px solid #cccccc", backgroundColor: "#ffffff", color: "#666666", fontWeight: "bold", cursor: "pointer" },
  saveBtn: { padding: "10px 20px", borderRadius: "8px", border: "none", backgroundColor: "#25d366", color: "#ffffff", fontWeight: "bold", cursor: "pointer" },
};
