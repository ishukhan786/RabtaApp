export default function MessageBox({ message }) {
  const isMine = message.sender === 'me';

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
        <p>{message.text}</p>
        <span>{message.time}</span>
      </div>
    </div>
  );
}
