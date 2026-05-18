import { useState, useEffect, useRef, useCallback } from "react";

export function useChat(selectedContact) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const ws = useRef(null);
  const typingTimeoutRef = useRef(null);
  const myUser = JSON.parse(localStorage.getItem("rabta_user") || "{}");
  const myUsername = myUser.username;

  // Fetch initial chat history when selectedContact changes
  useEffect(() => {
    if (!selectedContact || !myUsername) return;
    const token = localStorage.getItem("rabta_token");
    if (!token) return;

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    fetch(`${API_URL}/messages/${selectedContact}?token=${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch history");
        return res.json();
      })
      .then((data) => {
        setMessages(data);
      })
      .catch((err) => console.error("Error fetching messages:", err));
  }, [selectedContact, myUsername]);

  useEffect(() => {
    const token = localStorage.getItem("rabta_token");
    if (!token) return;

    // Connect WebSocket with token
    const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
    ws.current = new WebSocket(`${WS_URL}/ws?token=${token}`);

    ws.current.onopen = () => {
      console.log("✅ WebSocket Connected to RabtaApp");
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "online_users_list") {
          setOnlineUsers(data.users);
        } else if (data.type === "user_online") {
          setOnlineUsers((prev) => [...new Set([...prev, data.username])]);
        } else if (data.type === "user_offline") {
          setOnlineUsers((prev) => prev.filter((u) => u !== data.username));
        } else if (data.type === "message") {
          // Only add to current chat if message belongs to active conversation
          setMessages((prev) => {
            // Check if message is already in state (to avoid duplicates)
            if (prev.some((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });
        } else if (data.type === "typing") {
          if (data.is_typing) {
            setTypingUser(data.from);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              setTypingUser(null);
            }, 2000); // Reset typing status if no update after 2s
          } else {
            setTypingUser(null);
          }
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    ws.current.onclose = (event) => {
      console.log(`❌ WebSocket Disconnected. Code: ${event.code}, Reason: ${event.reason}`);
      setIsConnected(false);
      // Auto-disconnect on token expiry (code 4001)
      if (event.code === 4001) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("rabta_token");
        localStorage.removeItem("rabta_user");
        window.location.reload();
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Send Message
  const sendMessage = useCallback((recipient, text) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not connected");
      return;
    }

    const tempMsg = {
      id: Date.now().toString(),
      from: myUsername,
      to: recipient,
      text: text,
      timestamp: new Date().toISOString(),
    };

    ws.current.send(
      JSON.stringify({
        type: "message",
        to: recipient,
        text: text,
      })
    );

    // Optimistically update local UI
    setMessages((prev) => [...prev, tempMsg]);
  }, [myUsername]);

  // Typing indicator debounce logic (1 second debounce)
  const typingDebounceRef = useRef(null);
  const lastTypingState = useRef(false);

  const sendTyping = useCallback((recipient, isTyping) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    if (isTyping) {
      if (!lastTypingState.current) {
        ws.current.send(JSON.stringify({ type: "typing", to: recipient, is_typing: true }));
        lastTypingState.current = true;
      }
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(() => {
        ws.current.send(JSON.stringify({ type: "typing", to: recipient, is_typing: false }));
        lastTypingState.current = false;
      }, 1000); // 1 second debounce
    } else {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      if (lastTypingState.current) {
        ws.current.send(JSON.stringify({ type: "typing", to: recipient, is_typing: false }));
        lastTypingState.current = false;
      }
    }
  }, []);

  return {
    messages,
    onlineUsers,
    typingUser,
    isConnected,
    sendMessage,
    sendTyping,
    myUsername,
  };
}
