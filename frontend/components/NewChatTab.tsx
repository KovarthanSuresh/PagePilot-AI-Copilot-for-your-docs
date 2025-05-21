'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Props {
  summaryContext: string;
  pageNumber: number;
}

export default function NewChatTab({ summaryContext, pageNumber }: Props) {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    // add user message to history
    setHistory((h) => [...h, `You: ${message}`]);
    setMessage('');

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: message, context: summaryContext, page: pageNumber }),
      });
      const { answer } = await res.json();
      setHistory((h) => [...h, `GPT: ${answer || '⚠️ No answer'}`]);
    } catch {
      setHistory((h) => [...h, 'GPT: ❌ Error fetching answer']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md bg-gray-800 p-4 rounded-t-lg shadow-lg">
        <div className="max-h-40 overflow-y-auto mb-3 text-white space-y-1">
          {history.length
            ? history.map((line, i) => <div key={i}>{line}</div>)
            : <div className="text-gray-400">No messages yet</div>}
          {loading && <div className="text-gray-400">Thinking…</div>}
        </div>
        <div className="flex">
          <input
            type="text"
            className="flex-grow bg-gray-700 text-white placeholder-gray-400 rounded-l-full px-4 py-2 focus:outline-none"
            placeholder="Type your question…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-transparent rounded-r-full px-3 flex items-center justify-center disabled:opacity-50"
          >
            <Image src="/static/send-icon.png" alt="Send" width={24} height={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
