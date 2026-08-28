import json
from google import genai
from google.genai import types
from app.core.config import settings
from app.schemas.kanoon import KanoonQueryRequest, KanoonQueryResponse
from sqlalchemy.orm import Session

class KanoonService:
    def __init__(self):
        # The genai client will automatically pick up GEMINI_API_KEY from environment or it can be passed.
        api_key = settings.GEMINI_API_KEY or "DUMMY_KEY_FOR_TESTING"
        self.client = genai.Client(api_key=api_key)
            
    async def query(self, request: KanoonQueryRequest, user_id: str, db: Session, background_tasks) -> KanoonQueryResponse:
        from app.models.chat import Conversation, Message, FeatureType, MessageRole
        from app.ai.orchestrator import rag_orchestrator
        from app.services.title_service import generate_conversation_title_async
        import json
        from fastapi import HTTPException
        
        conversation = None
        
        if request.conversation_id:
            from app.models.user import User
            # Need to get email to resolve old UIDs
            db_user = db.query(User).filter(User.firebase_uid == user_id).first()
            target_uids = [user_id]
            if db_user:
                # If they have the same email as an old account, allow it
                old_users = db.query(User).filter(User.email == db_user.email).all()
                for u in old_users:
                    target_uids.append(u.firebase_uid)
                    
            conversation = db.query(Conversation).filter(
                Conversation.id == request.conversation_id,
                Conversation.user_id.in_(target_uids)
            ).first()

            if conversation and conversation.feature_type != FeatureType.know_kanoon:
                raise HTTPException(status_code=400, detail="Conversation does not belong to Know Your Kanoon.")
        
        if not conversation:
            title = "New Conversation"
            conversation = Conversation(
                user_id=user_id,
                title=title,
                feature_type=FeatureType.know_kanoon
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
            
            background_tasks.add_task(generate_conversation_title_async, conversation.id, request.question)

        # Save User Message
        user_msg = Message(
            conversation_id=conversation.id,
            role=MessageRole.user,
            content=request.question
        )
        db.add(user_msg)
        db.commit()

        # Load real history from DB instead of empty array
        past_messages = db.query(Message).filter(Message.conversation_id == conversation.id).order_by(Message.created_at.asc()).all()
        # the history parameter is expecting list of dicts. We skip the very last message which is the current user_msg.
        formatted_history = [{"role": m.role.value, "content": m.content} for m in past_messages[:-1]]

        # Translation IN
        detected_lang = request.detected_lang or "en"
        language = request.language or "en"
        query_for_rag = request.question

        if detected_lang != "en":
            from app.core.translate import translate_in
            query_for_rag = await translate_in(request.question, detected_lang)

        # Trigger Orchestrator
        filters = {
            "tenant_id": "global" # Only search system documents
        }
        
        response_data = rag_orchestrator.trigger_pipeline(
            question=query_for_rag,
            filters=filters,
            history=formatted_history
        )
        
        # Map Orchestrator response to Kanoon schema
        citations = response_data.get("citations", [])
        
        raw_answer = response_data.get("answer", "No answer generated.")
        
        import re
        
        # Extract the Executive Summary explicitly if it exists
        dynamic_summary = "Response generated based on retrieved legal knowledge."
        try:
            parsed_ans = json.loads(re.sub(r'^```(?:json)?\s*|\s*```$', '', raw_answer.strip()))
            if "problemAndRights" in parsed_ans and "summary" in parsed_ans["problemAndRights"]:
                dynamic_summary = parsed_ans["problemAndRights"]["summary"]
        except Exception:
            exec_summary_match = re.search(r'(?i)##\s*Executive Summary\s*\n(.*?)(?=\n##|\Z)', raw_answer, re.DOTALL)
            if exec_summary_match:
                dynamic_summary = exec_summary_match.group(1).strip()
                # Remove the Executive Summary from the raw_answer to prevent UI duplication
                new_raw_answer = raw_answer[:exec_summary_match.start()] + raw_answer[exec_summary_match.end():]
                if new_raw_answer.strip():
                    raw_answer = new_raw_answer.strip()
                else:
                    # If removing the summary leaves the answer completely empty, put it back or leave it as is
                    raw_answer = dynamic_summary
            else:
                paragraphs = [p.strip() for p in raw_answer.split('\n') if p.strip() and not p.strip().startswith('#') and not p.strip().startswith('{') and not p.strip().startswith('}')]
                dynamic_summary = paragraphs[0] if paragraphs else dynamic_summary
                if len(dynamic_summary) > 250:
                    dynamic_summary = dynamic_summary[:247] + "..."

        # Translation OUT
        translation_notice = None
        if language != "en":
            from app.core.translate import translate_out
            raw_answer, translation_notice = await translate_out(raw_answer, language)
            dynamic_summary, _ = await translate_out(dynamic_summary, language)

        final_json = {
            "answer": raw_answer,
            "summary": dynamic_summary,
            "similar_cases": "",  # Empty to not show old markdown
            "sources": citations,
            "disclaimer": "This information is generated by AI based on legal documents and does not constitute professional legal advice.",
            "category": "General Legal Query"
        }
        
        if translation_notice:
            final_json["translation_notice"] = translation_notice

        # Save Assistant Message
        assistant_msg = Message(
            conversation_id=conversation.id,
            role=MessageRole.assistant,
            content=json.dumps(final_json)
        )
        db.add(assistant_msg)
        db.commit()
        
        return KanoonQueryResponse(conversation_id=conversation.id, **final_json)


    async def query_stream(self, request: KanoonQueryRequest, user_id: str, db: Session, background_tasks):
        from app.models.chat import Conversation, Message, FeatureType, MessageRole
        from app.ai.orchestrator import rag_orchestrator
        from app.services.title_service import generate_conversation_title_async
        import json
        from fastapi import HTTPException

        conversation = None

        if request.conversation_id:
            from app.models.user import User
            db_user = db.query(User).filter(User.firebase_uid == user_id).first()
            target_uids = [user_id]
            if db_user:
                old_users = db.query(User).filter(User.email == db_user.email).all()
                for u in old_users:
                    target_uids.append(u.firebase_uid)

            conversation = db.query(Conversation).filter(
                Conversation.id == request.conversation_id,
                Conversation.user_id.in_(target_uids)
            ).first()

            if conversation and conversation.feature_type != FeatureType.know_kanoon:
                raise HTTPException(status_code=400, detail="Conversation does not belong to Know Your Kanoon.")

        if not conversation:
            title = "New Conversation"
            conversation = Conversation(
                user_id=user_id,
                title=title,
                feature_type=FeatureType.know_kanoon
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)

            background_tasks.add_task(generate_conversation_title_async, conversation.id, request.question)

        # Save User Message (always store the original user query, not the translated one)
        user_msg = Message(
            conversation_id=conversation.id,
            role=MessageRole.user,
            content=request.question
        )
        db.add(user_msg)
        db.commit()

        # Load real history
        past_messages = db.query(Message).filter(Message.conversation_id == conversation.id).order_by(Message.created_at.asc()).all()
        formatted_history = [{"role": m.role.value, "content": m.content} for m in past_messages[:-1]]

        filters = {"tenant_id": "global"}

        # ── Translation layer (Phase 1, MultiLingual-Update) ──────────────────
        # These two blocks are COMPLETELY INDEPENDENT.
        # translate_in  → controlled solely by detected_lang (query script heuristic)
        # translate_out → controlled solely by language (UI toggle / target language)

        # INPUT: translate non-English query to English before RAG
        detected_lang = request.detected_lang or "en"
        language      = request.language or "en"

        query_for_rag = request.question  # default: use original query

        if detected_lang != "en":
            # User typed in a regional script — translate to English for RAG
            from app.core.translate import translate_in
            query_for_rag = await translate_in(request.question, detected_lang)
        # If detected_lang == "en": query_for_rag stays as-is. No Groq call.

        # ── Async generator for SSE ───────────────────────────────────────────
        async def stream_generator():
            try:
                full_content = ""
                citations_data = []

                # Yield conversation ID first so frontend can update URL
                yield f"data: {json.dumps({'type': 'metadata', 'conversation_id': conversation.id})}\n\n"

                # Lightweight deterministic acronym expansion for better BM25 recall
                # (unchanged from original — only applied to the English query)
                search_query = query_for_rag
                expansions = {
                    "RTI": "RTI Right to Information",
                    "FIR": "FIR First Information Report Police",
                    "consumer forum": "consumer dispute redressal",
                    "rera": "Real Estate Regulatory Authority"
                }
                import re
                for acr, exp in expansions.items():
                    search_query = re.sub(rf'\b{acr}\b', exp, search_query, flags=re.IGNORECASE)

                if language == "en":
                    # ── ENGLISH PATH: true token streaming, completely unchanged ──
                    for event in rag_orchestrator.trigger_pipeline_stream(search_query, filters, formatted_history, task_type="CIVIC"):
                        if event.startswith("data: "):
                            try:
                                data = json.loads(event[6:])
                                if data['type'] == 'chunk':
                                    full_content += data['data']
                                elif data['type'] == 'complete':
                                    citations_data = data.get('citations', [])
                            except Exception:
                                pass
                        yield event

                else:
                    # ── NON-ENGLISH PATH: buffer RAG output, translate once, emit translated event ──
                    # Pass status events through so frontend can show progress indicators.
                    for event in rag_orchestrator.trigger_pipeline_stream(search_query, filters, formatted_history, task_type="CIVIC"):
                        if event.startswith("data: "):
                            try:
                                data = json.loads(event[6:])
                                if data['type'] == 'chunk':
                                    full_content += data['data']
                                    # Do NOT yield chunk events — we buffer silently
                                elif data['type'] == 'complete':
                                    citations_data = data.get('citations', [])
                                    # Do NOT yield the English complete event — we replace it below
                                elif data['type'] == 'status':
                                    yield event  # Pass status updates through for UX
                                elif data['type'] == 'metadata':
                                    yield event  # Pass metadata (conversation_id etc.) through
                                elif data['type'] == 'error':
                                    error_msg = data['data']
                                    from app.core.translate import translate_out
                                    translated_error, _ = await translate_out(error_msg, language)
                                    yield f"data: {json.dumps({'type': 'error', 'data': translated_error})}\n\n"
                            except Exception:
                                pass
                        # Any non-data: lines pass through
                        elif not event.startswith("data: "):
                            yield event

                    # OUTPUT: translate assembled English response → target language
                    # Controlled solely by language (UI toggle). Independent of detected_lang.
                    if full_content.strip():
                        from app.core.translate import translate_out
                        translated_text, translation_notice = await translate_out(full_content, language)

                        # Emit single translated event (replaces chunk stream for non-English)
                        yield f"data: {json.dumps({'type': 'translated', 'data': translated_text})}\n\n"
                    else:
                        translation_notice = None

                    # Emit complete event with citations + optional notice
                    complete_payload = {"type": "complete", "citations": citations_data}
                    if translation_notice:
                        complete_payload["translation_notice"] = translation_notice
                    yield f"data: {json.dumps(complete_payload)}\n\n"

                # ── Save to DB (both paths) ───────────────────────────────────
                import re as re2
                raw_answer = full_content  # always save the English RAG output
                dynamic_summary = "Response generated based on retrieved legal knowledge."
                try:
                    parsed_ans = json.loads(re2.sub(r'^```(?:json)?\s*|\s*```$', '', raw_answer.strip()))
                    if "problemAndRights" in parsed_ans and "summary" in parsed_ans["problemAndRights"]:
                        dynamic_summary = parsed_ans["problemAndRights"]["summary"]
                except Exception:
                    exec_summary_match = re2.search(r'(?i)##\s*Executive Summary\s*\n(.*?)(?=\n##|\Z)', raw_answer, re2.DOTALL)
                    if exec_summary_match:
                        dynamic_summary = exec_summary_match.group(1).strip()
                    else:
                        paragraphs = [p.strip() for p in raw_answer.split('\n') if p.strip() and not p.strip().startswith('#') and not p.strip().startswith('{') and not p.strip().startswith('}')]
                        dynamic_summary = paragraphs[0] if paragraphs else dynamic_summary
                        if len(dynamic_summary) > 250:
                            dynamic_summary = dynamic_summary[:247] + "..."

                final_json = {
                    "answer": raw_answer,
                    "summary": dynamic_summary,
                    "similar_cases": "",
                    "sources": citations_data,
                    "disclaimer": "This information is generated by AI based on legal documents.",
                    "category": "General Legal Query"
                }

                assistant_msg = Message(
                    conversation_id=conversation.id,
                    role=MessageRole.assistant,
                    content=json.dumps(final_json)
                )
                db.add(assistant_msg)
                db.commit()

            except Exception as e:
                import traceback
                traceback.print_exc()
                yield f"data: {json.dumps({'type': 'error', 'data': f'Backend Exception: {str(e)}'})}\n\n"

        return stream_generator()



kanoon_service = KanoonService()

