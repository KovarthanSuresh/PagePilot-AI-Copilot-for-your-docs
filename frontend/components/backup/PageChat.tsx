'use client';

import React, { useState } from 'react';

interface Props {
  summaryContext: string;
  pageNumber: number;
}

export default function PageChat({ summaryContext, pageNumber }: Props) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer('');

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: summaryContext,
          page: pageNumber,
        }),
      });

      const data = await res.json();
      const raw = data.answer || '⚠️ No response from the model.';
      
      // ✅ REMOVE <think>...</think>
      const cleaned = raw
      .replace(/<think[\s\S]*?<\/think>/gi, '') // match tags + content
      .replace(/&lt;think&gt;[\s\S]*?&lt;\/think&gt;/gi, '') // match escaped
      .trim();

      
      setAnswer(cleaned);
    } catch (err) {
      setAnswer('❌ Failed to get answer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-md mt-6">
      <h3 className="text-lg font-semibold mb-2">💬 Ask a follow-up question</h3>

      <textarea
        className="w-full border p-2 rounded resize-none text-sm"
        rows={3}
        placeholder="Type your question here..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button
        onClick={handleAsk}
        disabled={loading}
        className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Asking...' : 'Ask'}
      </button>

      {answer && (
        <div className="mt-4 p-3 bg-gray-50 border rounded text-sm text-gray-800">
          <strong>AI Answer:</strong>
          <div
            className="mt-2 prose prose-sm max-w-none"
            // ✅ render real HTML output
            dangerouslySetInnerHTML={{ __html: answer }}
          />
        </div>
      )}
    </div>
  );
}
