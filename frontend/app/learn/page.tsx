// File: frontend/app/learn/page.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import PageChat from '../components/PageChat';

const totalPages = 10;

export default function LearnPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const firstLoadRef = useRef(true);

  useEffect(() => {
    let active = true;
    const clearParam = firstLoadRef.current ? '&clearCache=1' : '';
    if (firstLoadRef.current) {
      setSummary('');
    }
    firstLoadRef.current = false;

    setLoading(true);
    fetch(`/api/summarize?page=${pageNumber}${clearParam}`)
      .then(res => res.json())
      .then(json => {
        if (!active) return;
        setSummary(json.summary ?? '⚠️ No summary available');
      })
      .catch(() => {
        if (!active) return;
        setSummary('❌ Error loading summary');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pageNumber]);

  const prev = () => setPageNumber(p => Math.max(1, p - 1));
  const next = () => setPageNumber(p => Math.min(totalPages, p + 1));

  return (
    <div className="relative h-screen flex flex-col">
      <div
        className="flex flex-1 bg-gray-800 text-white pb-20 overflow-hidden"
        style={{ height: 'calc(100vh - 80px)' }}
      >
        <div className="flex-1 flex flex-col items-center justify-start px-4 pt-10 pb-4 bg-gray-900">
          <Image
            src={`/static/pages/page_${pageNumber}.png`}
            alt={`Page ${pageNumber}`}
            width={600}
            height={708}
            className="object-contain rounded shadow"
          />
          <div className="mt-4 flex items-center justify-center gap-x-[60px]">
            <button
              onClick={prev}
              disabled={pageNumber === 1}
              className="px-4 py-6 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {pageNumber} of {totalPages}</span>
            <button
              onClick={next}
              disabled={pageNumber === totalPages}
              className="px-4 py-6 bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="w-1/2 flex flex-col px-12 pb-8 bg-gray-800 h-[calc(100vh-80px)]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Image src="/static/loading.gif" alt="Loading…" width={64} height={64} />
            </div>
          ) : (
            <div className="flex-1 overflow-auto pr-20">
              <div
                className="prose prose-invert max-w-none"
                style={{ paddingRight: '5rem' }}
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            </div>
          )}
        </div>
      </div>

      <PageChat summaryContext={summary} pageNumber={pageNumber} />
    </div>
  );
}
