import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

export default function App() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('toclient', (data) => {
      setMessages((current) => [
        ...current,
        {
          id: createId(),
          text: data?.msg || '',
        },
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    const text = message.trim();

    if (!text) {
      return;
    }

    socketRef.current?.emit('fromclient', { msg: text });
    setMessage('');
  }

  return (
    <main className="app-shell">
      <section className="chat-panel">
        <header className="chat-header">
          <div>
            <p className="eyebrow">node.socket</p>
            <h1>Socket messages</h1>
          </div>
          <span className={connected ? 'connection is-online' : 'connection'}>
            {connected ? 'Online' : 'Offline'}
          </span>
        </header>

        <form className="message-form" onSubmit={handleSubmit}>
          <input
            aria-label="Message"
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type a message"
            type="text"
            value={message}
          />
          <button type="submit">Send</button>
        </form>

        <section className="message-list" aria-live="polite" aria-label="Messages">
          {messages.length === 0 ? (
            <p className="empty-state">No messages yet.</p>
          ) : (
            messages.map((item) => (
              <article className="message-item" key={item.id}>
                {item.text}
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  );
}
