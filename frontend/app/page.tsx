'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import PageChat from './components/PageChat';

const totalPages = 10;

export default function HomePage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch(`/api/summarize?page=${pageNumber}`)
      .then(res => res.json())
      .then(json => {
        if (active) setSummary(json.summary ?? '⚠️ No summary available');
      })
      .catch(() => {
        if (active) setSummary('❌ Error loading summary');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [pageNumber]);

  const prev = () => setPageNumber(p => Math.max(1, p - 1));
  const next = () => setPageNumber(p => Math.min(totalPages, p + 1));

  return (
    <>
      {/* TWO-COLUMN CONTAINER */}
      <div className="flex h-screen bg-gray-800 text-white">
        {/* LEFT: PDF Viewer */}
        <div className="flex-1 flex flex-col items-center justify-start p-4  bg-gray-900">
          <div className="bg-gray-700 p-2 rounded shadow">
            <Image
              src={`/static/pages/page_${pageNumber}.png`}
              alt={`Page ${pageNumber}`}
              width={700}
              height={700}
              className="object-contain"
            />
          </div>
          <div className="mt-4 flex items-center justify-center gap-x-12 w-full max-w-md">
            <button
              onClick={prev}
              disabled={pageNumber === 1}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50 mr-8"
            >
              Previous
            </button>
            <span className="text-white px-4">Page {pageNumber} of {totalPages}</span>
            <button
              onClick={next}
              disabled={pageNumber === totalPages}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50 ml-8"
            >
              Next
            </button>
          </div>
        </div>

        {/* RIGHT: AI Summary */}
        <div className="w-1/2 flex flex-col p-8 overflow-y-auto bg-gray-800 max-h-[calc(100vh-80px)] pb-25">
          {loading ? (
            <p className="text-gray-400">Loading summary…</p>
          ) : (
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: summary }}
            />
          )}
        </div>
      </div>

      {/* FLOATING CHAT BAR (unchanged) */}
      <PageChat summaryContext={summary} pageNumber={pageNumber} />
    </>
  );
}
