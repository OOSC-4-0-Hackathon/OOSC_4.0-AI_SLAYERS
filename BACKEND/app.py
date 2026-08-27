import os
import spaces
import gradio as gr
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.routing import Mount, Route

# ── Stitch ChromaDB if needed ──────────────────────────────────────
try:
    base_dir = os.path.dirname(__file__)
    db_path = os.path.join(base_dir, "chroma_db_backup", "chroma.sqlite3")
    if not os.path.exists(db_path):
        from chroma_db_backup.stitch_db import stitch_file
        stitch_file(db_path)
except Exception as e:
    print(f"Chroma stitching note: {e}")

# ── ZeroGPU keep-alive (required by HF runtime) ───────────────────
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

    Backend API endpoints are live under `/v1`.
    """)
    btn = gr.Button("GPU Heartbeat Check")
    out = gr.Textbox(label="Status", value="Ready")
    btn.click(warmup_gpu, outputs=out)
    demo.load(warmup_gpu, outputs=out)

# ── Critical: Insert the backend Mount at position 0 in demo.app.routes
#    BEFORE Gradio's SvelteKit catch-all route, so /v1/* requests are
#    handled by our FastAPI backend instead of the Gradio HTML frontend.
demo.app.routes.insert(0, Mount("/v1", app=backend))

# ── Launch ─────────────────────────────────────────────────────────
demo.queue().launch(server_name="0.0.0.0", server_port=7860)
