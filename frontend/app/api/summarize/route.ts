// File: frontend/app/api/summarize/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

const BACKEND_URL = 'http://localhost:8000/summarize';
// Cache directory directly under project root
const CACHE_DIR = path.resolve(process.cwd(), 'cache', 'summaries');

// Ensure cache directory exists
async function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    await fsPromises.mkdir(CACHE_DIR, { recursive: true });
    console.log('📁 [summarize] Cache directory created at', CACHE_DIR);
  }
}

// Clear cache directory
function clearCacheDir() {
  if (fs.existsSync(CACHE_DIR)) {
    fs.rmSync(CACHE_DIR, { recursive: true, force: true });
    console.log('🧹 [summarize] Cache cleared in', CACHE_DIR);
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const pageParam = url.searchParams.get('page') ?? '1';
  const clear = url.searchParams.get('clearCache') === '1';
  const page = parseInt(pageParam, 10);

  if (clear) {
    clearCacheDir();
  }

  await ensureCacheDir();

  const cacheFile = path.join(CACHE_DIR, `page_${page}.txt`);

  if (fs.existsSync(cacheFile)) {
    const raw = await fsPromises.readFile(cacheFile, 'utf-8');
    console.log(`🗄️ [summarize] Cache hit for page ${page}`);
    return NextResponse.json({ summary: raw });
  }

  console.log(`⚙️ [summarize] Cache miss for page ${page}`);

  const resp = await fetch(`${BACKEND_URL}?page=${page}`);
  if (!resp.ok) {
    console.error(`❌ [summarize] Backend error ${resp.status}`);
    return new NextResponse('Error fetching summary', { status: 502 });
  }
  const body = await resp.json();
  const summaryText = body.summary ?? '';

  try {
    await fsPromises.writeFile(cacheFile, summaryText, 'utf-8');
    console.log(`✅ [summarize] Cached page ${page} to`, cacheFile);
  } catch (e) {
    console.error('❌ [summarize] Error writing cache', e);
  }

  return NextResponse.json({ summary: summaryText });
}
