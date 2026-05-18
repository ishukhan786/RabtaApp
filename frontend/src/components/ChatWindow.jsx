import MessageBox from './MessageBox';
import { Mic, MoreVertical, Paperclip, Phone, Send, Smile, Video } from 'lucide-react';

export default function ChatWindow({ chat, messages = [], onSendMessage }) {
  if (!chat) {
    return <main className="empty-chat">Select a chat</main>;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = form.get('message')?.trim();
    if (!text) return;
    onSendMessage?.(text);
    event.currentTarget.reset();
  }

  return (
    <main className="chat-window">
      <header className="chat-header">
        <div className="header-user">
          <div className="avatar large">{chat.name.slice(0, 1)}</div>
          <div>
            <h2>{chat.name}</h2>
            <p>{chat.status === 'typing' ? 'typing now' : 'online'}</p>
          </div>
        </div>
        <div className="icon-actions">
          <button title="Audio call"><Phone size={18} /></button>
          <button title="Video call"><Video size={18} /></button>
          <button title="More"><MoreVertical size={18} /></button>
        </div>
      </header>
      <section className="messages-area">
        <div className="day-pill">Today</div>
        {messages.map((message) => (
          <MessageBox key={message.id} message={message} />
        ))}
      </section>
      <form className="composer" onSubmit={handleSubmit}>
        <button type="button" title="Emoji"><Smile size={19} /></button>
        <button type="button" title="Attach"><Paperclip size={19} /></button>
        <input
          name="message"
          placeholder="Write a message..."
        />
        <button type="button" title="Voice note"><Mic size={19} /></button>
        <button className="send-button" title="Send message">
          <Send size={18} />
        </button>
      </form>
    </main>
  );
}
