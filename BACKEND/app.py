import os
import spaces
import gradio as gr

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
    return "ZeroGPU Initialized & Ready"

# Initialize Firebase and core configurations
from app.core.config import settings
from app.core.firebase import initialize_firebase
from app.database.database import Base, engine
from app.routes import auth, kanoon, upload_chat, chat, drafting, reasoning, admin, form_filler

try:
    initialize_firebase()
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Init note: {e}")

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

# Directly register all FastAPI routers onto demo.app
demo.app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
demo.app.include_router(kanoon.router, prefix="/api/kanoon", tags=["Know Your Kanoon"])
demo.app.include_router(upload_chat.router, prefix="/api/upload-chat", tags=["Upload & Chat"])
demo.app.include_router(chat.router, prefix="/api/chat", tags=["Chat History"])
demo.app.include_router(drafting.router, prefix="/api/drafting", tags=["Drafting"])
demo.app.include_router(reasoning.router, prefix="/api/reasoning", tags=["Reasoning"])
demo.app.include_router(form_filler.router, prefix="/api/form-filler", tags=["Form Filler"])
demo.app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@demo.app.get("/api/health")
async def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}

if __name__ == "__main__":
    demo.queue().launch()
