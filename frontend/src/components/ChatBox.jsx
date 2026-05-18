import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../hooks/useChat";

export default function ChatBox() {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  // Fetch all registered users to populate contacts list
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    fetch(`${API_URL}/users`)
      .then((res) => res.json())
      .then((data) => {
        const myUser = JSON.parse(localStorage.getItem("rabta_user") || "{}");
        // Filter out myself from contacts list
        const otherUsers = data.filter((u) => u.username !== myUser.username);
        setContacts(otherUsers);
        if (otherUsers.length > 0 && !selectedContact) {
          setSelectedContact(otherUsers[0].username);
        }
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const {
    messages,
    onlineUsers,
    typingUser,
    isConnected,
    sendMessage,
    sendTyping,
    myUsername,
  } = useChat(selectedContact);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;
    sendMessage(selectedContact, inputText.trim());
    setInputText("");
    sendTyping(selectedContact, false);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (selectedContact) {
      sendTyping(selectedContact, e.target.value.length > 0);
    }
  };

  return (
    <div style={styles.container}>
      {/* LEFT SIDEBAR: Contacts */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Chats</h2>
          <span style={{ ...styles.connectionDot, backgroundColor: isConnected ? "#25d366" : "#ff5252" }} title={isConnected ? "Connected" : "Disconnected"} />
        </div>
        <div style={styles.contactsList}>
          {contacts.length === 0 ? (
            <p style={styles.noContacts}>No other users registered yet.</p>
          ) : (
            contacts.map((contact) => {
              const isOnline = onlineUsers.includes(contact.username);
              const isSelected = selectedContact === contact.username;
              return (
                <div
                  key={contact.username}
                  onClick={() => setSelectedContact(contact.username)}
                  style={{
                    ...styles.contactItem,
                    backgroundColor: isSelected ? "#ebebeb" : "transparent",
                  }}
                >
                  <div style={styles.avatar}>
                    {contact.avatar || contact.username.charAt(0).toUpperCase()}
                    {isOnline && <span style={styles.onlineBadge} />}
                  </div>
                  <div style={styles.contactInfo}>
                    <div style={styles.contactName}>{contact.name || contact.username}</div>
                    <div style={styles.contactBio}>{contact.bio || "Hey there! I am using RaabtaApp."}</div>
                    <div style={styles.contactStatus}>
                      {isOnline ? (
                        <span style={{ color: "#25d366", fontWeight: "500", fontSize: "12px" }}>● Online</span>
                      ) : (
                        <span style={{ color: "#999999", fontSize: "12px" }}>○ Offline</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT AREA: Active Chat Box */}
      <div style={styles.chatArea}>
        {selectedContact ? (
          (() => {
            const selectedObj = contacts.find((c) => c.username === selectedContact);
            const dispAvatar = selectedObj?.avatar || selectedContact.charAt(0).toUpperCase();
            const dispName = selectedObj?.name || selectedContact;
            const dispBio = selectedObj?.bio || "Hey there! I am using RaabtaApp.";
            return (
              <>
                {/* Chat Header */}
                <div style={styles.chatHeader}>
                  <div style={styles.chatHeaderInfo}>
                    <div style={styles.chatHeaderAvatar}>
                      {dispAvatar}
                    </div>
                    <div>
                      <h3 style={styles.chatHeaderName}>{dispName}</h3>
                      <div style={{ fontSize: "12px", color: "#666", marginTop: "2px", fontStyle: "italic" }}>{dispBio}</div>
                      <div style={styles.chatHeaderStatus}>
                        {onlineUsers.includes(selectedContact) ? (
                          <span style={{ color: "#25d366", fontWeight: "600" }}>🟢 Online</span>
                        ) : (
                          <span style={{ color: "#999999" }}>⚪ Offline</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

            {/* Messages Display */}
            <div style={styles.messagesContainer}>
              {messages.map((msg) => {
                const isMe = msg.from === myUsername;
                return (
                  <div
                    key={msg.id}
                    style={{
                      ...styles.messageWrapper,
                      justifyContent: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        ...styles.messageBubble,
                        backgroundColor: isMe ? "#dcf8c6" : "#ffffff",
                        borderTopLeftRadius: isMe ? "8px" : "0px",
                        borderTopRightRadius: isMe ? "0px" : "8px",
                      }}
                    >
                      {/* Show sender name */}
                      <div style={styles.senderName}>
                        {isMe ? "You" : msg.from}
                      </div>
                      <div style={styles.messageText}>{msg.text}</div>
                      <div style={styles.messageTime}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {typingUser === selectedContact && (
                <div style={styles.typingContainer}>
                  <div style={styles.typingBubble}>
                    <span style={styles.typingText}>
                      ✍️ <strong>{typingUser}</strong> is typing...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} style={styles.inputBar}>
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={`Message ${selectedContact}...`}
                style={styles.input}
              />
              <button type="submit" style={styles.sendButton}>
                Send 🚀
              </button>
            </form>
          </>
            );
          })()
        ) : (
          <div style={styles.noChatSelected}>
            <h3>👋 Welcome to RabtaApp</h3>
            <p>Select a contact from the sidebar to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "calc(100vh - 60px)", // Adjusting for App header
    backgroundColor: "#ededed",
    fontFamily: "sans-serif",
    overflow: "hidden",
  },
  sidebar: {
    width: "320px",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #dddddd",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: {
    padding: "16px",
    backgroundColor: "#f0f2f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #dddddd",
  },
  sidebarTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111b21",
  },
  connectionDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    display: "inline-block",
  },
  contactsList: {
    flex: 1,
    overflowY: "auto",
  },
  noContacts: {
    padding: "20px",
    textAlign: "center",
    color: "#666666",
    fontSize: "14px",
  },
  contactItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #f2f2f2",
    transition: "background-color 0.2s",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#128c7e",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "bold",
    position: "relative",
    marginRight: "16px",
  },
  onlineBadge: {
    position: "absolute",
    bottom: "2px",
    right: "2px",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "#25d366",
    border: "2px solid #ffffff",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#111b21",
    marginBottom: "2px",
  },
  contactBio: {
    fontSize: "13px",
    color: "#666666",
    marginBottom: "4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "180px",
  },
  contactStatus: {
    fontSize: "13px",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#efeae2",
  },
  chatHeader: {
    padding: "12px 20px",
    backgroundColor: "#f0f2f5",
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid #dddddd",
  },
  chatHeaderInfo: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  chatHeaderAvatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    backgroundColor: "#128c7e",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justify: "center",
    fontSize: "18px",
    fontWeight: "bold",
  },
  chatHeaderName: {
    margin: 0,
    fontSize: "17px",
    color: "#111b21",
  },
  chatHeaderStatus: {
    fontSize: "13px",
    marginTop: "2px",
  },
  messagesContainer: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  messageWrapper: {
    display: "flex",
    width: "100%",
  },
  messageBubble: {
    maxWidth: "65%",
    padding: "8px 12px",
    borderRadius: "8px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
  senderName: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#128c7e",
    marginBottom: "4px",
  },
  messageText: {
    fontSize: "15px",
    color: "#111b21",
    lineHeight: "1.4",
  },
  messageTime: {
    fontSize: "11px",
    color: "#666666",
    alignSelf: "flex-end",
    marginTop: "4px",
  },
  typingContainer: {
    display: "flex",
    justifyContent: "flex-start",
  },
  typingBubble: {
    backgroundColor: "#ffffff",
    padding: "8px 16px",
    borderRadius: "16px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  typingText: {
    fontSize: "13px",
    color: "#128c7e",
    fontStyle: "italic",
  },
  inputBar: {
    padding: "12px 20px",
    backgroundColor: "#f0f2f5",
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: "14px 18px",
    borderRadius: "24px",
    border: "1px solid #ffffff",
    fontSize: "15px",
    outline: "none",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  sendButton: {
    backgroundColor: "#25d366",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "24px",
    border: "none",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "background-color 0.2s",
  },
  noChatSelected: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#666666",
    padding: "40px",
  },
};
