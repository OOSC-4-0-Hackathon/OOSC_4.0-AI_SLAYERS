import os
import spaces
import gradio as gr

@spaces.GPU
def gpu_worker():
    return "ZeroGPU Online & Ready"

# Automatically stitch ChromaDB sqlite parts if needed
try:
    base_dir = os.path.dirname(__file__)
    db_path = os.path.join(base_dir, 'chroma_db_backup', 'chroma.sqlite3')
    if not os.path.exists(db_path):
        from chroma_db_backup.stitch_db import stitch_file
        stitch_file(db_path)
except Exception as e:
    print(f"Chroma stitching note: {e}")

from app.main import app as fastapi_app

# Lightweight status UI for Hugging Face Spaces
with gr.Blocks(title="NYAAY AI — Civic Legal OS Backend", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # ⚖️ NYAAY AI Backend Service
    **Status: Online & Ready (NVIDIA ZeroGPU 16GB)**
    
    All statutory RAG endpoints, zero-LLM intent routers, and dossier streaming APIs are live under `/api`.
    """)
    btn = gr.Button("Check Engine Status")
    out = gr.Textbox(label="Status", value="Ready")
    btn.click(gpu_worker, outputs=out)

# Mount the Gradio UI onto the FastAPI application
app = gr.mount_gradio_app(fastapi_app, demo, path="/")
