import base64
import os
import requests
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

# Compute project root directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
# Paths for images and cache
IMAGE_FOLDER = os.path.join(BASE_DIR, 'frontend', 'public', 'static', 'pages')
CACHE_DIR = os.path.join(BASE_DIR, 'cache', 'summaries')
# Ensure cache directory exists
os.makedirs(CACHE_DIR, exist_ok=True)

TOGETHER_API_KEY = "tgp_v1_UaDAyciJU0EAQtyvwagpE6SzMpQzlVqISJHojc4nwwI"
MODEL_ID = "meta-llama/Llama-Vision-Free"
TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions"

PROMPT = """
You are a NEET PG Orthopaedics professor teaching from a revision note image.

Your job is to explain all the content found in the image as if you're tutoring a student. The page may contain definitions, classifications, diagrams, lists, or important points.

Respond using HTML formatting only. Do not use Markdown symbols like *, **, #, etc.

Follow this format:

<h2>Topic Title</h2>

<h3>Subtopic Heading</h3>
<p>Explain this section clearly in a short paragraph.</p>

<h3>Another Section</h3>
<ul>
  <li><b>Bold Label:</b> Short explanation.</li>
  <li><b>Another Term:</b> Clarification.</li>
</ul>

Use `<p>...</p>` for readable paragraphs. Use `<ul><li>...</li></ul>` for clean bullet points under a heading. Use `<b>...</b>` for key terms.

Never say “the handwritten note”. Never summarize — just explain directly. Output only the HTML content.
"""

@router.get("/summarize")
async def summarize_page(page: int = Query(...)):
    # File‐based cache check
    cache_file = os.path.join(CACHE_DIR, f"page_{page}.txt")
    if os.path.exists(cache_file):
        with open(cache_file, 'r', encoding='utf-8') as cf:
            cached = cf.read()
        return {"page": page, "summary": cached}

    # Verify image exists
    image_path = os.path.join(IMAGE_FOLDER, f"page_{page}.png")
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail=f"Image not found at {image_path}")

    # Read and encode image
    with open(image_path, "rb") as f:
        image_bytes = f.read()
    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    # Prepare payload
    payload = {
        "model": MODEL_ID,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{base64_image}"}
                    }
                ]
            }
        ]
    }
    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(TOGETHER_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()
        output = result["choices"][0]["message"]["content"].strip()

        # Cache the result
        with open(cache_file, 'w', encoding='utf-8') as cf:
            cf.write(output)

        return {"page": page, "summary": output}

    except Exception as e:
        print("❌ Together Vision API Error:", e)
        raise HTTPException(status_code=500, detail="Together AI failed to generate summary.")
