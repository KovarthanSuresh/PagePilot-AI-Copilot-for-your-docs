# prepbuddy/backend/main.py

import os
import shutil

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.summarize import router as summarize_router
from backend.routes.chat      import router as chat_router

app = FastAPI()

# Enable CORS so your frontend can call these endpoints
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to your cache folder (relative to project root)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CACHE_DIR = os.path.join(BASE_DIR, 'cache', 'summaries')


@app.on_event("startup")
async def clear_cache_on_restart():
    """
    Delete and recreate the cache directory every time the backend restarts.
    """
    if os.path.exists(CACHE_DIR):
        shutil.rmtree(CACHE_DIR)
    os.makedirs(CACHE_DIR, exist_ok=True)


# Mount your routers
app.include_router(summarize_router)
app.include_router(chat_router)


# Optional health check
@app.get("/ping")
async def ping():
    return {"ping": "pong"}
