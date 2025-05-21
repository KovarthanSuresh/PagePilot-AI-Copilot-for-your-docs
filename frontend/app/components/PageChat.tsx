// prepbuddy/frontend/app/components/PageChat.tsx
'use client';

import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  CSSProperties,
} from 'react';
import Image from 'next/image';
import sendIcon from '/public/static/send-icon.png';

interface PageChatProps {
  summaryContext: string;
  pageNumber: number;
}

type Message = { sender: 'user' | 'ai'; text: string };

export default function PageChat({
  summaryContext,
  pageNumber,
}: PageChatProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!collapsed) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, collapsed]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    const userText = message.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setMessage('');
    setSending(true);

    try {
      const res = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          context: summaryContext,
          page: pageNumber,
        }),
      });
      const { answer } = await res.json();
      setMessages((prev) => [...prev, { sender: 'ai', text: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: '❌ Error getting response' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const historyStyle: CSSProperties = {
    maxHeight: collapsed ? 0 : '60vh',
    overflowY: collapsed ? 'hidden' : 'auto',
    padding: collapsed ? '0' : '0 8px',
    backgroundColor: collapsed ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    transition: 'max-height 0.3s ease, padding 0.3s ease',
  };

  const bubbleStyle = (sender: 'user' | 'ai'): CSSProperties => ({
    backgroundColor: sender === 'user' ? '#4B5563' : '#1F2937',
    color: '#F9FAFB',
    borderRadius: 16,
    padding: '8px 12px',
    maxWidth: '80%',
    whiteSpace: 'pre-wrap',
  });

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 20px)',
        maxWidth: 800,
        zIndex: 1000,
      }}
    >
      {/* Message history */}
      <div style={historyStyle}>
        {!collapsed &&
          messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent:
                  m.sender === 'user' ? 'flex-end' : 'flex-start',
                margin: '4px 0',
              }}
            >
              <div
                style={bubbleStyle(m.sender)}
                {...(m.sender === 'ai'
                  ? { dangerouslySetInnerHTML: { __html: m.text } }
                  : {})}
              >
                {m.sender === 'user' ? m.text : null}
              </div>
            </div>
          ))}

        {/* Preloader while waiting */}
        {!collapsed && sending && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              margin: '4px 0',
            }}
          >
            <div
              style={{
                fontStyle: 'italic',
                color: '#D1D5DB',
                padding: '8px 12px',
                backgroundColor: '#374151',
                borderRadius: 16,
              }}
            >
              Generating response…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Collapse button (only when expanded) */}
      {!collapsed && (
        <div className="flex justify-end pr-4 pb-1">
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Collapse chat history"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              color: 'white',
              cursor: 'pointer',
            }}
          >
            🔽
          </button>
        </div>
      )}

      {/* Input bar (click to expand history) */}
      <div
        onClick={() => setCollapsed(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#E5E7EB',
          borderRadius: 9999,
          height: 45,
          padding: '0 16px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          cursor: 'text',
        }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your message…"
          disabled={sending}
          style={{
            flexGrow: 1,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: 16,
            color: '#111827',
          }}
        />
        <button
          onClick={handleSend}
          disabled={sending}
          aria-label="Send"
          style={{
            marginLeft: 8,
            padding: 8,
            border: 'none',
            background: 'transparent',
            borderRadius: '50%',
            cursor: sending ? 'not-allowed' : 'pointer',
          }}
        >
          <Image src={sendIcon} alt="Send" width={24} height={24} />
        </button>
      </div>
    </div>
  );
}
