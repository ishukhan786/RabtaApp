import React, { useState } from "react";

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim() || (isRegister && (!name.trim() || !email.trim()))) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const endpoint = isRegister ? "/register" : "/login";
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const bodyData = isRegister 
      ? { name: name.trim(), username: username.trim(), email: email.trim(), password }
      : { username: username.trim(), password };
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      // Store in localStorage
      localStorage.setItem("rabta_token", data.token);
      localStorage.setItem("rabta_user", JSON.stringify(data.user));
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>💬 RabtaApp</h1>
          <p style={styles.subtitle}>
            {isRegister ? "Create a new account" : "Sign in to your account"}
          </p>
        </div>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ishtiaq Khan"
                style={styles.input}
                required={isRegister}
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. ishtiaq"
              style={styles.input}
              required
            />
          </div>

          {isRegister && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ishtiaq@example.com"
                style={styles.input}
                required={isRegister}
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              style={styles.toggleButton}
            >
              {isRegister ? "Login here" : "Register here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#ece5dd",
    fontFamily: "sans-serif",
    padding: "20px",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "420px",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#075e54",
    padding: "30px 20px",
    textAlign: "center",
    color: "#ffffff",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "bold",
  },
  subtitle: {
    margin: "8px 0 0",
    fontSize: "15px",
    opacity: 0.9,
  },
  errorBanner: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: "12px 16px",
    fontSize: "14px",
    textAlign: "center",
    borderBottom: "1px solid #ef9a9a",
    fontWeight: "500",
  },
  form: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333333",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #cccccc",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  button: {
    backgroundColor: "#25d366",
    color: "#ffffff",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.2s",
    marginTop: "10px",
  },
  footer: {
    padding: "16px 24px 24px",
    textAlign: "center",
    borderTop: "1px solid #eeeeee",
  },
  footerText: {
    margin: 0,
    fontSize: "14px",
    color: "#666666",
  },
  toggleButton: {
    background: "none",
    border: "none",
    color: "#128c7e",
    fontWeight: "bold",
    cursor: "pointer",
    padding: 0,
    fontSize: "14px",
    textDecoration: "underline",
  },
};
