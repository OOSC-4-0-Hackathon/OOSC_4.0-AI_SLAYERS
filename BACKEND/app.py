import os
import spaces
import gradio as gr
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ── Stitch ChromaDB if needed ──────────────────────────────────────
try:
    base_dir = os.path.dirname(__file__)
    db_path = os.path.join(base_dir, "chroma_db_backup", "chroma.sqlite3")
    if not os.path.exists(db_path):
        from chroma_db_backup.stitch_db import stitch_file
        stitch_file(db_path)
except Exception as e:
    print(f"Chroma stitching note: {e}")

# ── ZeroGPU keep-alive ────────────────────────────────────────────
@spaces.GPU
def warmup_gpu():
    return "ZeroGPU Initialized & Online"

# ── Initialize backend services ────────────────────────────────────
from app.core.config import settings
from app.core.firebase import initialize_firebase
from app.database.database import Base, engine

try:
    initialize_firebase()
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Init note: {e}")

# ── Build standalone FastAPI backend ───────────────────────────────
from app.routes import auth, kanoon, upload_chat, chat, drafting, reasoning, admin, form_filler

backend = FastAPI(title="NYAAY AI Backend API")

backend.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

backend.include_router(auth.router,        prefix="/auth",        tags=["Authentication"])
backend.include_router(kanoon.router,      prefix="/kanoon",      tags=["Know Your Kanoon"])
backend.include_router(upload_chat.router, prefix="/upload-chat", tags=["Upload & Chat"])
backend.include_router(chat.router,        prefix="/chat",        tags=["Chat History"])
backend.include_router(drafting.router,    prefix="/drafting",    tags=["Drafting"])
backend.include_router(reasoning.router,   prefix="/reasoning",   tags=["Reasoning"])
backend.include_router(form_filler.router, prefix="/form-filler", tags=["Form Filler"])
backend.include_router(admin.router,       prefix="/admin",       tags=["Admin"])

@backend.get("/health")
async def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT, "database": "configured"}

@backend.get("/ready")
async def ready():
    return {"status": "ready"}

# ── Gradio status UI ──────────────────────────────────────────────
with gr.Blocks(title="NYAAY AI — Civic Legal OS Backend", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # ⚖️ NYAAY AI Backend Service
    **Status: Online & Ready (NVIDIA ZeroGPU 16GB)**
    """)
    btn = gr.Button("GPU Heartbeat Check")
    out = gr.Textbox(label="Status", value="Ready")
    btn.click(warmup_gpu, outputs=out)
    demo.load(warmup_gpu, outputs=out)

# ── Build the combined ASGI app ────────────────────────────────────
# 1. Let Gradio build its full ASGI app (queue + routes + middleware)
demo.queue()

# 2. Create a top-level FastAPI app that mounts both
top = FastAPI()
top.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount backend FIRST at /v1 — FastAPI checks mounts in order
top.mount("/v1", backend)
# Mount Gradio at root — this is the catch-all
top.mount("/", demo.app)

# ── Serve with uvicorn ─────────────────────────────────────────────
import uvicorn
uvicorn.run(top, host="0.0.0.0", port=7860)
