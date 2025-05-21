from pdf2image import convert_from_path
import os

PDF_PATH = 'resources/orthopaedics.pdf'           # PDF location
OUTPUT_DIR = 'frontend/public/static/pages/'       # Where to store PNGs

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"Converting {PDF_PATH} to images...")
pages = convert_from_path(PDF_PATH, dpi=200)

for i, page in enumerate(pages, start=1):
    output_path = os.path.join(OUTPUT_DIR, f'page_{i}.png')
    page.save(output_path, 'PNG')
    print(f"Saved: {output_path}")

print("✅ Conversion complete.")
