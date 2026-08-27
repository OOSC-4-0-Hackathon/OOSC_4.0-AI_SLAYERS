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

    Backend API endpoints are live under `/v1`.
    """)
    btn = gr.Button("GPU Heartbeat Check")
    out = gr.Textbox(label="Status", value="Ready")
    btn.click(warmup_gpu, outputs=out)
    demo.load(warmup_gpu, outputs=out)

# ── ASGI-level path dispatcher ─────────────────────────────────────
# Gradio's SvelteKit catch-all intercepts ALL paths including mounts.
# The ONLY way to bypass it is to wrap the entire ASGI app and dispatch
# at the raw ASGI level, before Gradio's routing even sees the request.

_gradio_asgi = demo.app  # Save reference to original Gradio ASGI app

class _TopLevelRouter:
    """Raw ASGI dispatcher: /v1/* → FastAPI backend, else → Gradio."""
    def __init__(self, gradio_app, api_app, prefix="/v1"):
        self.gradio = gradio_app
        self.api = api_app
        self.prefix = prefix
        self._api_ready = False

    async def __call__(self, scope, receive, send):
        if scope["type"] in ("http", "websocket"):
            path = scope.get("path", "")
            if path == self.prefix or path.startswith(self.prefix + "/"):
                # Strip prefix so backend sees clean paths like /health
                scope = dict(scope)
                scope["path"] = path[len(self.prefix):] or "/"
                scope["root_path"] = scope.get("root_path", "") + self.prefix
                await self.api(scope, receive, send)
                return
        await self.gradio(scope, receive, send)

# Replace demo.app with our wrapper so HF's uvicorn serves our dispatcher
demo.app = _TopLevelRouter(_gradio_asgi, backend)

# ── Launch ─────────────────────────────────────────────────────────
demo.queue().launch(server_name="0.0.0.0", server_port=7860)
