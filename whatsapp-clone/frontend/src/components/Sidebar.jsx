import { Edit3, MessageCircle, Search, Settings } from 'lucide-react';

export default function Sidebar({ chats = [], activeChatId, onSelectChat }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand-mini">
          <MessageCircle size={20} />
          <span>Rabta</span>
        </div>
        <div className="icon-actions">
          <button title="New chat"><Edit3 size={17} /></button>
          <button title="Settings"><Settings size={17} /></button>
        </div>
      </div>
      <label className="search-box">
        <Search size={17} />
        <input placeholder="Search chats" />
      </label>
      <div className="chat-list">
        {chats.map((chat) => (
          <button
            key={chat.id}
            className={`chat-list-item ${activeChatId === chat.id ? 'active' : ''}`}
            onClick={() => onSelectChat?.(chat)}
          >
            <div className="avatar">{chat.name.slice(0, 1)}</div>
            <div className="chat-item-copy">
              <div className="chat-item-head">
                <span>{chat.name}</span>
                <time>10:24</time>
              </div>
              <div className="chat-item-foot">
                <p>{chat.status === 'typing' ? 'typing...' : chat.lastMessage}</p>
                {chat.unread > 0 && <strong>{chat.unread}</strong>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
