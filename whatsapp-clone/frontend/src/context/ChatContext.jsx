import { createContext, useContext, useMemo, useState } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [activeChatId, setActiveChatId] = useState(null);
  const value = useMemo(() => ({ activeChatId, setActiveChatId }), [activeChatId]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  return useContext(ChatContext);
}
