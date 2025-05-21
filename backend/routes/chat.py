# backend/routes/chat.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import re
from pathlib import Path
import json
import logging

# Logger for cache events
logger = logging.getLogger("uvicorn.error")

router = APIRouter()

# Together AI configuration
TOGETHER_API_KEY = "tgp_v1_UaDAyciJU0EAQtyvwagpE6SzMpQzlVqISJHojc4nwwI"
MODEL_ID = "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"
TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"

# JSON-based cache for summaries (cleared on server restart)
CACHE_FILE = Path(__file__).parent.parent / "summary_cache.json"
# Remove existing cache file on startup
if CACHE_FILE.exists():
    try:
        CACHE_FILE.unlink()
        logger.info(f"Cleared summary cache file {CACHE_FILE}")
    except Exception:
        pass
# In-memory mirror of JSON cache
_summary_cache = {}

class ChatRequest(BaseModel):
    question: str
    context: str
    page: int

@router.post("/ask")
async def ask_ai(payload: ChatRequest):
    prompt = f"""
You are a NEET PG Orthopaedics expert tutor.

Use the following context from a medical summary to answer the student's follow-up question clearly, in a detailed and well-formatted explanation.

Always respond using HTML tags for clean formatting:
- Use <h2> for topic titles
- Use <p> for paragraphs
- Use <b> for key terms
- Use <ul><li>...</li></ul> only if listing things clearly

Never use markdown symbols like * or **.
Never include <think>...</think> or any internal thoughts.
Just answer clearly like you're tutoring a student.

<context>
{payload.context}
</context>

Student's Question:
{payload.question}
"""
    try:
        res = requests.post(
            TOGETHER_API_URL,
            json={"model": MODEL_ID, "messages": [{"role": "user", "content": prompt}]},
            headers={
                "Authorization": f"Bearer {TOGETHER_API_KEY}",
                "Content-Type": "application/json"
            }
        )
        res.raise_for_status()
        data = res.json()
        raw = data["choices"][0]["message"]["content"].strip()
        # Clean internal reasoning blocks
        clean = re.sub(r"<think>.*?</think>", "", raw, flags=re.DOTALL)
        # Normalize whitespace and collapse blank lines
        clean = re.sub(r"\r\n|\r", "\n", clean)
        clean = re.sub(r"\n\s*\n+", "\n", clean)
        # Collapse spaces between tags
        clean = re.sub(r">\s+<", "><", clean).strip()
        return {"answer": clean}
    except Exception as e:
        logger.error(f"/ask error: {e}")
        raise HTTPException(status_code=500, detail="Chat API failure")

@router.get("/summarize")
async def summarize(page: int):
    """
    Summary endpoint: on first request, calls call_summary(page), cleans, caches in JSON,
    and returns. Subsequent requests read from in-memory _summary_cache (loaded from JSON).
    Cache is removed on server restart.
    """
    key = str(page)
    # Load JSON cache on first call
    global _summary_cache
    if not _summary_cache and CACHE_FILE.exists():
        try:
            _summary_cache = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
        except Exception:
            _summary_cache = {}

    # Serve from cache if available
    if key in _summary_cache:
        logger.info(f"Cache hit for page {page}")
        return {"summary": _summary_cache[key], "cached": True}

    # Cache miss: generate, clean, store
    logger.info(f"Cache miss for page {page}, generating summary")
    try:
        from backend.main import call_summary
        raw_summary = call_summary(page)
        clean = re.sub(r"<think>.*?</think>", "", raw_summary, flags=re.DOTALL)
        clean = re.sub(r"\r\n|\r", "\n", clean)
        clean = re.sub(r"\n\s*\n+", "\n", clean)
        clean = re.sub(r">\s+<", "><", clean).strip()
        # Update caches
        _summary_cache[key] = clean
        # Persist to JSON
        CACHE_FILE.write_text(json.dumps(_summary_cache), encoding="utf-8")
        return {"summary": clean, "cached": False}
    except Exception as e:
        logger.error(f"/summarize error: {e}")
        raise HTTPException(status_code=500, detail="Summary generation failure")
