import os
import spaces
import gradio as gr

@spaces.GPU
def warmup_gpu():
    return "ZeroGPU Online"

# Stitch Chroma database if needed
try:
    base_dir = os.path.dirname(__file__)
    db_path = os.path.join(base_dir, 'chroma_db_backup', 'chroma.sqlite3')
    if not os.path.exists(db_path):
        from chroma_db_backup.stitch_db import stitch_file
        stitch_file(db_path)
except Exception as e:
    print(f"Chroma stitching note: {e}")

from app.main import app as fastapi_app

with gr.Blocks(title="NYAAY AI — Civic Legal OS Backend", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # ⚖️ NYAAY AI Backend Service
    **Status: Online & Ready (NVIDIA ZeroGPU 16GB)**
    
    All statutory RAG endpoints, zero-LLM intent routers, and dossier streaming APIs are live under `/api`.
    """)
    btn = gr.Button("GPU Check")
    out = gr.Textbox(label="Status", value="Ready")
    btn.click(warmup_gpu, outputs=out)
    demo.load(warmup_gpu, outputs=out)

# Merge all FastAPI routes directly into demo.app so /api/* routes are directly accessible
for route in fastapi_app.routes:
    demo.app.routes.append(route)

demo.app.state = fastapi_app.state

if __name__ == "__main__":
    demo.queue().launch()
