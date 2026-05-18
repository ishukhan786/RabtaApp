import { useState } from 'react';
import ChatWindow from '../components/ChatWindow';
import Sidebar from '../components/Sidebar';

const initialChats = [
  { id: '1', name: 'Family Group', lastMessage: 'Dinner at 8?', unread: 3, status: 'online' },
  { id: '2', name: 'Ali Khan', lastMessage: 'See you soon.', unread: 0, status: 'typing' },
  { id: '3', name: 'Design Team', lastMessage: 'Final assets shared.', unread: 1, status: 'online' },
];

const initialMessages = [
  { id: 'm1', sender: 'them', text: 'Assalam o alaikum! Did you check the new dashboard?', time: '10:20' },
  { id: 'm2', sender: 'me', text: 'Walaikum assalam. Yes, the UI feels much cleaner now.', time: '10:21' },
  { id: 'm3', sender: 'them', text: 'Great. Send me the latest build when ready.', time: '10:23' },
];

export default function Home() {
  const [activeChat, setActiveChat] = useState(initialChats[0]);
  const [messages, setMessages] = useState(initialMessages);

  function sendMessage(text) {
    setMessages((items) => [...items, { id: crypto.randomUUID(), sender: 'me', text, time: 'Now' }]);
  }

  return (
    <div className="app-frame">
      <div className="chat-shell">
        <Sidebar chats={initialChats} activeChatId={activeChat?.id} onSelectChat={setActiveChat} />
        <ChatWindow chat={activeChat} messages={messages} onSendMessage={sendMessage} />
      </div>
    </div>
  );
}
