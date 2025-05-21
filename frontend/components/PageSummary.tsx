'use client';

import React, { useState } from 'react';

interface Props {
  summary: string;
}

export default function PageSummary({ summary }: Props) {
  const [open, setOpen] = useState(false);

  if (!summary) return null;

  // Function to convert tagged summary into formatted HTML
  const renderFormattedSummary = () => {
    const html = summary
      .replace(/<title>(.*?)<\/title>/g, '<h2 class="text-xl font-bold mb-2">$1</h2>')
      .replace(/<topic>(.*?)<\/topic>/g, '<h3 class="text-lg font-semibold mt-4 mb-1">$1</h3>')
      .replace(/<ul>/g, '<ul class="list-disc ml-6 mb-3">')
      .replace(/<\/ul>/g, '</ul>')
      .replace(/<li>/g, '<li class="mb-1">')
      .replace(/<\/li>/g, '</li>')
      .replace(/<b>(.*?)<\/b>/g, '<strong>$1</strong>');

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="border rounded-lg shadow bg-white mb-6">
      <button
        className="w-full text-left p-4 font-semibold text-lg bg-gray-100 hover:bg-gray-200"
        onClick={() => setOpen(!open)}
      >
        📄 AI Summary {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="p-4 text-gray-800">
          {renderFormattedSummary()}
        </div>
      )}
    </div>
  );
}
