import os
import spaces
import gradio as gr
from fastapi.middleware.cors import CORSMiddleware

# Automatically stitch ChromaDB sqlite parts if needed
try:
    base_dir = os.path.dirname(__file__)
    db_path = os.path.join(base_dir, 'chroma_db_backup', 'chroma.sqlite3')
    if not os.path.exists(db_path):
        from chroma_db_backup.stitch_db import stitch_file
        stitch_file(db_path)
except Exception as e:
    print(f"Chroma stitching note: {e}")

@spaces.GPU
def warmup_gpu():
    return "ZeroGPU Initialized & Online"

from app.main import app as fastapi_app

# Status interface for Hugging Face Spaces
with gr.Blocks(title="NYAAY AI — Civic Legal OS Backend", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # ⚖️ NYAAY AI Backend Service
    **Status: Online & Ready (NVIDIA ZeroGPU 16GB)**
    
    All statutory RAG endpoints, zero-LLM intent routers, and dossier streaming APIs are live under `/api`.
    """)
    btn = gr.Button("GPU Heartbeat Check")
    out = gr.Textbox(label="Status", value="Ready")
    btn.click(warmup_gpu, outputs=out)
    demo.load(warmup_gpu, outputs=out)

# Allow all CORS origins on demo.app so Vercel requests are never blocked
demo.app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Merge all routes from fastapi_app directly into demo.app at top priority
for route in reversed(fastapi_app.routes):
    demo.app.routes.insert(0, route)

demo.app.state = fastapi_app.state

# Launch via Gradio queue for ZeroGPU lifecycle
demo.queue().launch(server_name="0.0.0.0", server_port=7860)
