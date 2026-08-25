from app.knowledge.hybrid_retriever import hybrid_retriever
from app.knowledge.embeddings import embedding_service
from app.core.config import settings
from app.core.key_rotator import key_rotator
import re
import time
from typing import Dict, Any, List
from app.knowledge.metadata_utils import get_canonical_source_name
from app.core.logger import logger
import concurrent.futures
from google import genai
from google.genai import types

from app.ai.guardrails import guardrails
from app.ai.prompt_builder import prompt_builder
from app.core.metrics import global_metrics
from app.ai.validator import calculate_retrieval_confidence, validate_response, extract_reasoning_confidence

class RAGOrchestrator:
    def __init__(self):
        # Base client for quick tasks, but we'll use rotator for heavy gen
        self.client = genai.Client(api_key=key_rotator.get())
        
    def _analyze_and_expand_query(self, question: str, history: List[Dict[str, Any]]) -> str:
        sys_prompt = """You are a legal query analyzer. Extract the core legal issue from the user's query and expand it into a comprehensive search query for a legal vector database.
Include relevant legal concepts, synonyms, and possible statutory frameworks (e.g., if it's about garbage collection, include solid waste management, municipal sanitation duties, public health, administrative inaction, nuisance, etc.).
DO NOT just repeat the user's text. Extract the true legal problem.
Output ONLY the expanded search query, nothing else."""
        
        history_text = "Conversation History:\\n"
        if history:
            for msg in history[-4:]:
                text_content = msg.get('content') or (msg.get('parts', [{}])[0].get('text', ''))
                history_text += f"{msg['role']}: {text_content}\\n"
        else:
            history_text = "No history."
            
        user_prompt = f"{history_text}\\nUser Query: {question}\\nExpanded Legal Search Query:"
        
        try:
            temp_client = genai.Client(api_key=key_rotator.get())
            import time
            for attempt in range(3):
                try:
                    res = temp_client.models.generate_content(
                        model='gemini-3.6-flash',
                        contents=user_prompt,
                        config=types.GenerateContentConfig(system_instruction=sys_prompt)
                    )
                    break
                except Exception as e:
                    if "503" in str(e) and attempt < 2:
                        time.sleep(2)
                        continue
                    raise e
            expanded = res.text.strip()
            logger.info(f"Query expanded: '{question}' -> '{expanded}'")
            return expanded
        except Exception as e:
            logger.warning(f"Query expansion failed: {e}")
            return question


    def _estimate_complexity(self, question: str) -> bool:
        q = question.lower()
        has_sc_request = bool(re.search(r'\b(supreme court|sc judgment|precedent|case law|held)\b', q))
        has_multi_domain = bool(re.search(r'\b(rera|consumer|constitutional|fundamental right|natural justice)\b', q)) and bool(re.search(r'\b(compensation|refund|criminal|arrest|bail)\b', q))
        word_count = len(question.split())
        is_very_long = word_count > 100
        signals = sum([has_sc_request, has_multi_domain, is_very_long])
        return signals >= 1

    def _analyze_query_structured(self, question: str, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        sys_prompt = """You are a legal case strategist. Analyze the user's query and decompose it into a structured CASE_OBJECT.
Return ONLY this JSON:
{
  "case_summary": "A clear, plain-language summary of the dispute.",
  "legal_issues": ["Specific legal question 1", "Specific legal question 2"],
  "material_facts": ["Fact 1", "Fact 2"],
  "missing_facts": ["What critical information is missing? (e.g., State, Date of notice)"],
  "sub_queries": ["Search query for issue 1", "Search query for issue 2"],
  "domains": {"Domain Name": 0.9},
  "explicit_sc_requested": true|false
}
Rules:
- sub_queries: 1-5 concise retrieval strings optimized for a vector database.
- domains: only Indian legal domains; confidence float (e.g. 0.9).
- explicit_sc_requested: true only if user explicitly mentions SC/precedent/case law.
Output ONLY the JSON. No explanation."""
        user_prompt = f"User Query: {question}\nJSON Output:"
        try:
            temp_client = genai.Client(api_key=key_rotator.get())
            import time
            import json
            for attempt in range(3):
                try:
                    res = temp_client.models.generate_content(
                        model='gemini-3.6-flash',
                        contents=user_prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=sys_prompt,
                            response_mime_type="application/json"
                        )
                    )
                    break
                except Exception as e:
                    if "503" in str(e) and attempt < 2:
                        time.sleep(2)
                        continue
                    raise e
            return json.loads(res.text)
        except Exception as e:
            logger.warning(f"Structured analysis failed: {e}")
            return {"case_summary": question, "legal_issues": [], "material_facts": [], "missing_facts": [], "sub_queries": [question], "domains": {}, "explicit_sc_requested": False}

    def _multi_query_retrieve(self, sub_queries: List[str], base_query_embedding: List[float], predicted_domains: Dict[str, float], doc_type_priority: str, filters: Dict[str, Any], explicit_sc_requested: bool) -> List[Dict[str, Any]]:
        if not sub_queries:
            return []
            
        import concurrent.futures
        
        prefix = "Represent this sentence for searching relevant passages: "
        try:
            embeddings = embedding_service.embed_texts([prefix + sq for sq in sub_queries])
        except Exception:
            embeddings = [base_query_embedding] * len(sub_queries)
                
        all_results = []
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
            future_to_sq_idx = {}
            for i, sq in enumerate(sub_queries):
                f = ex.submit(
                    hybrid_retriever.search,
                    query=sq,
                    query_embedding=embeddings[i],
                    n_results=10,
                    where=filters,
                    predicted_domains=predicted_domains,
                    document_type_priority=doc_type_priority
                )
                future_to_sq_idx[f] = i
                
            if explicit_sc_requested:
                if hasattr(hybrid_retriever, 'search_sc_only'):
                    for i, sq in enumerate(sub_queries):
                        f = ex.submit(
                            hybrid_retriever.search_sc_only,
                            query=sq,
                            query_embedding=embeddings[i],
                            n_results=5,  # 5 per sub_query to prevent overloading context
                            predicted_domains=predicted_domains
                        )
                        future_to_sq_idx[f] = i
                    
            for f in concurrent.futures.as_completed(future_to_sq_idx):
                sq_idx = future_to_sq_idx[f]
                try:
                    res = f.result()
                    for r in res:
                        if "sub_issue_ids" not in r["metadata"]:
                            r["metadata"]["sub_issue_ids"] = set()
                        r["metadata"]["sub_issue_ids"].add(sq_idx)
                    all_results.extend(res)
                except Exception as e:
                    logger.warning(f"Parallel retrieval failed: {e}")
                    
        dedup_map = {}
        for r in all_results:
            cid = r["id"]
            if cid not in dedup_map:
                dedup_map[cid] = r
            else:
                dedup_map[cid]["metadata"]["sub_issue_ids"].update(r["metadata"]["sub_issue_ids"])
                if r.get("metadata", {}).get("final_score", 0) > dedup_map[cid].get("metadata", {}).get("final_score", 0):
                    # Keep the higher score, but maintain merged sub_issue_ids
                    merged_issues = dedup_map[cid]["metadata"]["sub_issue_ids"]
                    dedup_map[cid] = r
                    dedup_map[cid]["metadata"]["sub_issue_ids"] = merged_issues
                    
        unique_results = list(dedup_map.values())
        
        # Fair Allocation: Pick top N per sub_issue to guarantee issue coverage
        final_selected = []
        selected_ids = set()
        
        # Round-robin selection across sub-queries
        for r in unique_results:
            r['metadata']['sub_issue_ids'] = list(r['metadata']['sub_issue_ids'])
            
        unique_results.sort(key=lambda x: x.get("metadata", {}).get("final_score", 0), reverse=True)
        
        target_total = 20
        per_issue_target = max(1, target_total // len(sub_queries))
        
        issue_counts = {i: 0 for i in range(len(sub_queries))}
        
        # 1. Fill minimum per issue
        for i in range(len(sub_queries)):
            for r in unique_results:
                if r["id"] not in selected_ids and i in r["metadata"]["sub_issue_ids"]:
                    if issue_counts[i] < per_issue_target:
                        final_selected.append(r)
                        selected_ids.add(r["id"])
                        issue_counts[i] += 1
                        
        # 2. Fill remaining with highest overall scores
        for r in unique_results:
            if len(final_selected) >= target_total:
                break
            if r["id"] not in selected_ids:
                final_selected.append(r)
                selected_ids.add(r["id"])
                
        return final_selected

    def _filter_relevant_chunks(self, question: str, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not chunks:
            return chunks
            
        sys_prompt = """You are a Legal Relevance Evaluator for a RAG system.
Evaluate each retrieved legal document chunk against the user's query.

A chunk is PRIMARY_GOVERNING if it directly governs the core legal issue.
A chunk is SUPPORTING if it provides useful background law or establishes procedural rules that are actually applicable to the specific domain.
A chunk is IRRELEVANT if it is disconnected from the legal principles at hand OR if it is a procedural rule from an entirely unrelated domain (e.g., retrieving the Arms Act for a general "natural justice" query).

CRITICAL INSTRUCTION: Do NOT retain a chunk as SUPPORTING merely because it shares a procedural term (like 'opportunity of being heard') if the statute itself (e.g. THOT Act, Arms Act) has nothing to do with the user's facts. Err on the side of IRRELEVANT for unrelated statutes.

Respond with a valid JSON array of objects, where each object has 'id' (the chunk index provided), 'classification' (one of the 3 labels), and 'reasoning' (a brief explanation)."""

        from app.knowledge.metadata_utils import get_canonical_source_name
        user_prompt = f"User's Legal Query: {question}\\n\\n"
        for i, chunk in enumerate(chunks):
            meta = chunk.get("metadata", {})
            src = get_canonical_source_name(meta)
            user_prompt += f"--- Chunk ID: {i} | Source: {src} ---\\n{chunk['document'][:800]}\\n\\n"
            
        try:
            temp_client = genai.Client(api_key=key_rotator.get())
            import time
            for attempt in range(3):
                try:
                    res = temp_client.models.generate_content(
                        model='gemini-3.6-flash',
                        contents=user_prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=sys_prompt,
                            response_mime_type="application/json"
                        )
                    )
                    break
                except Exception as e:
                    if "503" in str(e) and attempt < 2:
                        time.sleep(2)
                        continue
                    raise e
            import json
            classifications = json.loads(res.text)
            
            valid_indices = set()
            for item in classifications:
                if item.get("classification") in ["PRIMARY_GOVERNING", "SUPPORTING"]:
                    valid_indices.add(item.get("id"))
                    
            filtered_chunks = [chunks[i] for i in range(len(chunks)) if i in valid_indices]
            logger.info(f"Filtered chunks from {len(chunks)} down to {len(filtered_chunks)}")
            return filtered_chunks
        except Exception as e:
            logger.warning(f"Relevance filtering failed: {e}")
            return chunks
    def trigger_pipeline(self, question: str, filters: Dict[str, Any] = None, history: List[Dict[str, Any]] = None, task_type: str = "QA") -> Dict[str, Any]:
        """
        Executes the full RAG pipeline for a given question.
        """
        import time
        overall_start = time.time()
        
        # 1. Input Guardrails
        if not guardrails.validate_input(question):
            return self._fallback_response("Your question violates safety or length policies.")

        is_complex = True if task_type == "CIVIC" else self._estimate_complexity(question)
        query_analysis = {}
        
        if is_complex:
            query_analysis = self._analyze_query_structured(question, history)
            search_query = query_analysis.get("sub_queries", [question])[0]
            predicted_domains = query_analysis.get("domains", {})
            
            # Failsafe Domain Prediction
            if not predicted_domains:
                from app.ai.domain_classifier import domain_classifier
                logger.info("Structured domains empty. Falling back to domain_classifier.")
                domain_preds = domain_classifier.predict_domain(search_query)
                predicted_domains = domain_preds.get("domains", {})
                
            doc_type_priority = "any"
            explicit_sc = query_analysis.get("explicit_sc_requested", False)
            
            emb_start = time.time()
            try:
                query_embedding = embedding_service.embed_query(search_query)
            except Exception as e:
                logger.error(f"Failed to embed query: {e}")
                return self._fallback_response("Internal error while processing your question.")
            emb_latency = round(time.time() - emb_start, 2)
            
            retrieval_start = time.time()
            try:
                chunks = self._multi_query_retrieve(
                    (query_analysis.get("sub_queries") or [question]),
                    query_embedding,
                    predicted_domains,
                    doc_type_priority,
                    filters,
                    explicit_sc
                )
            except Exception as e:
                logger.error(f"Vector search failed: {e}")
                return self._fallback_response("Failed to retrieve context.")
                
        else:
            search_query = self._analyze_and_expand_query(question, history)
            
            emb_start = time.time()
            try:
                query_embedding = embedding_service.embed_query(search_query)
            except Exception as e:
                logger.error(f"Failed to embed query: {e}")
                return self._fallback_response("Internal error while processing your question.")
            emb_latency = round(time.time() - emb_start, 2)
            
            if not query_embedding:
                return self._fallback_response("Failed to process question text.")
                
            from app.ai.domain_classifier import domain_classifier
            domain_predictions = domain_classifier.predict_domain(search_query)
            predicted_domains = domain_predictions.get("domains", {})
            doc_type_priority = domain_predictions.get("document_type_priority", "any")

            retrieval_start = time.time()
            try:
                chunks = hybrid_retriever.search(
                    query=search_query, 
                    query_embedding=query_embedding, 
                    n_results=10, 
                    where=filters,
                    predicted_domains=predicted_domains,
                    document_type_priority=doc_type_priority
                )
            except Exception as e:
                logger.error(f"Vector search failed: {e}")
                return self._fallback_response("Failed to retrieve context.")
        retrieval_latency = round(time.time() - retrieval_start, 2)
        
        # Calculate Retrieval Confidence (Python Scoring)
        r_conf_score, r_conf_label, r_conf_reason, avg_score, max_score = calculate_retrieval_confidence(chunks, query_analysis if is_complex else None)

        # 4. Prompt Construction
        pc_start = time.time()
        system_instruction, user_prompt = prompt_builder.construct_prompt(question, chunks, history, task_type=task_type, query_analysis=query_analysis if is_complex else None)
        pc_latency = round(time.time() - pc_start, 2)
        
        gen_start = time.time()

        # 5. Generation (Single LLM Call)
        raw_answer, retry_sleep_time = self._generate_with_fallback(system_instruction, user_prompt)
        
        # 6. Deterministic Validation & Repair
        if raw_answer:
            is_valid, validated_answer = validate_response(raw_answer)
            if not is_valid:
                logger.warning(f"Validation failed: {validated_answer}. Regenerating once.")
                # Single Regeneration
                raw_answer, retry_sleep_time2 = self._generate_with_fallback(system_instruction, user_prompt)
                retry_sleep_time += retry_sleep_time2
                if raw_answer:
                    is_valid, validated_answer = validate_response(raw_answer)
                    raw_answer = validated_answer if is_valid else None
            else:
                raw_answer = validated_answer
                
        gen_total_latency = time.time() - gen_start
        model_processing_time = round(max(0, gen_total_latency - retry_sleep_time), 2)
        total_latency = round(time.time() - overall_start, 2)
        
        metrics = {
            "embedding_time": emb_latency,
            "retrieval_time": retrieval_latency,
            "prompt_construction_time": pc_latency,
            "model_processing_time": model_processing_time,
            "retry_delay_time": retry_sleep_time,
            "total_latency": total_latency
        }
        
        if not raw_answer:
            global_metrics.record_failure("llm_failures")
            return self._fallback_response("Failed to generate an answer. The AI service may be overloaded.")

        # 7. Extract Reasoning Confidence & Append Metadata
        rs_score, rs_label = extract_reasoning_confidence(raw_answer)
        
        # Extract all numbers from inside brackets (e.g. [4], [4, 7])
        used_citations = set()
        for bracket_content in re.findall(r'\[([^\]]+)\]', raw_answer):
            used_citations.update(re.findall(r'\d+', bracket_content))
            
        auth_retrieved = len(chunks)
        auth_used = len(used_citations)
        
        statutes_used = 0
        sc_used = 0
        
        citations = []
        for i, chunk in enumerate(chunks):
            marker_num = str(i + 1)
            if marker_num in used_citations:
                from app.knowledge.metadata_utils import get_canonical_source_name
                meta = chunk.get("metadata", {})
                src_name = get_canonical_source_name(meta)
                domain = meta.get("legal_domain", "")
                
                if meta.get("document_type") == "statute" or "Act" in src_name or "Sanhita" in src_name:
                    statutes_used += 1
                elif meta.get("document_type") == "judgment" or meta.get("court") == "Supreme Court" or "Supreme Court" in src_name:
                    sc_used += 1
                    
                citations.append({
                    "marker": f"[{marker_num}]",
                    "text_snippet": chunk["document"][:150] + "...",
                    "source_name": src_name,
                    "article_or_section": meta.get("section", meta.get("article", "Unknown")),
                    "legal_domain": domain,
                    "retrieval_method": meta.get("retrieval_method", "unknown"),
                    "similarity_score": meta.get("rrf_score", 0.0),
                    "retrieval_rank": meta.get("retrieval_rank", i + 1),
                    "chunk_used_by_llm": True,
                    "metadata": meta,
                    "full_relevant_text": chunk["document"]
                })

        advanced_metadata = {
            "authorities_retrieved": auth_retrieved,
            "authorities_used": auth_used,
            "statutes_used": statutes_used,
            "sc_judgments_used": sc_used,
            "average_retrieval_score": round(avg_score, 4),
            "highest_retrieval_score": round(max_score, 4),
            "retrieval_time": retrieval_latency,
            "generation_time": model_processing_time,
            "corpus_coverage": "High" if auth_retrieved > 5 else "Low",
            "reasoning_confidence_score": rs_score
        }

        confidence_payload = {
            "level": r_conf_label if r_conf_label else "🟡 Moderate",
            "reason": r_conf_reason if r_conf_reason else "Derived from retrieved authorities."
        }

        return {
            "answer": raw_answer,
            "citations": citations,
            "confidence": confidence_payload,
            "advanced_metadata": advanced_metadata,
            "metrics": metrics
        }

    def trigger_pipeline_stream(self, question: str, filters: Dict[str, Any] = None, history: List[Dict[str, Any]] = None, task_type: str = "QA"):
        import time
        import re
        import random
        from app.knowledge.metadata_utils import get_canonical_source_name
        import asyncio
        import json
        from app.core.config import settings
        
        overall_start = time.time()
        
        yield f"data: {json.dumps({'type': 'status', 'data': 'Analyzing intent...'})}\n\n"
        
        if not guardrails.validate_input(question):
            yield f"data: {json.dumps({'type': 'error', 'data': 'Your question violates safety or length policies.'})}\n\n"
            return

        is_complex = True if task_type == "CIVIC" else self._estimate_complexity(question)
        query_analysis = {}
        
        if is_complex:
            query_analysis = self._analyze_query_structured(question, history)
            search_query = (query_analysis.get("sub_queries") or [question])[0]
            predicted_domains = query_analysis.get("domains", {})
            
            # Failsafe Domain Prediction
            if not predicted_domains:
                from app.ai.domain_classifier import domain_classifier
                logger.info("Structured domains empty. Falling back to domain_classifier.")
                domain_preds = domain_classifier.predict_domain(search_query)
                predicted_domains = domain_preds.get("domains", {})
                
            doc_type_priority = "any"
            explicit_sc = query_analysis.get("explicit_sc_requested", False)
            
            yield f"data: {json.dumps({'type': 'status', 'data': 'Searching legal corpus...'})}\n\n"
            emb_start = time.time()
            try:
                query_embedding = embedding_service.embed_query(search_query)
            except:
                yield f"data: {json.dumps({'type': 'error', 'data': 'Internal error while processing your question.'})}\n\n"
                return
            emb_latency = round(time.time() - emb_start, 2)
            
            retrieval_start = time.time()
            try:
                chunks = self._multi_query_retrieve(
                    (query_analysis.get("sub_queries") or [question]),
                    query_embedding,
                    predicted_domains,
                    doc_type_priority,
                    filters,
                    explicit_sc
                )
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'data': 'Failed to retrieve context.'})}\n\n"
                return
                
        else:
            search_query = self._analyze_and_expand_query(question, history)
            
            yield f"data: {json.dumps({'type': 'status', 'data': 'Searching legal corpus...'})}\n\n"
            emb_start = time.time()
            try:
                query_embedding = embedding_service.embed_query(search_query)
            except:
                yield f"data: {json.dumps({'type': 'error', 'data': 'Internal error while processing your question.'})}\n\n"
                return
            emb_latency = round(time.time() - emb_start, 2)
            
            if not query_embedding:
                yield f"data: {json.dumps({'type': 'error', 'data': 'Failed to process question text.'})}\n\n"
                return
                
            from app.ai.domain_classifier import domain_classifier
            domain_predictions = domain_classifier.predict_domain(search_query)
            predicted_domains = domain_predictions.get("domains", {})
            doc_type_priority = domain_predictions.get("document_type_priority", "any")

            retrieval_start = time.time()
            try:
                chunks = hybrid_retriever.search(
                    query=search_query, 
                    query_embedding=query_embedding, 
                    n_results=12, 
                    where=filters,
                    predicted_domains=predicted_domains,
                    document_type_priority=doc_type_priority
                )
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'data': 'Failed to retrieve context.'})}\n\n"
                return
        retrieval_latency = round(time.time() - retrieval_start, 2)
        
        # EXTRACT DETERMINISTIC METADATA EARLY
        extracted_authorities = set()
        extracted_docs = set()
        for c in chunks[:3]:
            m = c.get("metadata", {})
            if "authority" in m:
                extracted_authorities.add(m["authority"])
            if "document_type" in m:
                extracted_docs.add(m["document_type"])
                
        # Emit metadata early
        metadata_payload = {
            "authorities": list(extracted_authorities) if extracted_authorities else ["Refer to cited procedure"],
            "documents": list(extracted_docs)
        }
        yield f"data: {json.dumps({'type': 'metadata', 'data': metadata_payload})}\n\n"

        pc_start = time.time()
        system_instruction, user_prompt = prompt_builder.construct_prompt(question, chunks, history, task_type=task_type, query_analysis=query_analysis if is_complex else None)
        pc_latency = round(time.time() - pc_start, 2)
        
        yield f"data: {json.dumps({'type': 'status', 'data': 'Generating response...'})}\n\n"

        gen_start = time.time()
        full_text = ""
        ttft = None
        
        try:
            model_name = getattr(settings, "CIVIC_MODEL", "gemini-flash-lite-latest")
            current_key = key_rotator.get()
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                max_output_tokens=2048,
            )
            # Disable thinking if possible
            try:
                config.thinking_config = types.ThinkingConfig(disabled=True)
            except Exception:
                pass

            import threading
            import queue
            
            q = queue.Queue()
            
            def run_gen():
                try:
                    temp_client = genai.Client(api_key=current_key)
                    response_stream = temp_client.models.generate_content_stream(
                        model=model_name,
                        contents=user_prompt,
                        config=config,
                    )
                    for chunk in response_stream:
                        q.put(("chunk", chunk.text))
                    q.put(("done", None))
                except Exception as e:
                    q.put(("error", e))
                    
            t = threading.Thread(target=run_gen)
            t.start()
            
            deadline = time.time() + 25
            while True:
                time_left = deadline - time.time()
                if time_left <= 0:
                    yield f"data: {json.dumps({'type': 'error', 'data': '\n\n[Generation timed out to meet 25s SLA]'})}\n\n"
                    break
                    
                try:
                    msg_type, data = q.get(timeout=min(0.5, time_left))
                    if msg_type == "chunk":
                        if ttft is None:
                            ttft = time.time() - gen_start
                        if data:
                            full_text += data
                            if task_type != "CIVIC":
                                yield f"data: {json.dumps({'type': 'chunk', 'data': data})}\n\n"
                    elif msg_type == "done":
                        break
                    elif msg_type == "error":
                        error_str = str(data)
                        logger.warning(f"Streaming error: {error_str}")
                        if "GenerateRequestsPerDayPerProject" in error_str:
                            key_rotator.remove_key(current_key)
                        yield f"data: {json.dumps({'type': 'error', 'data': 'Generation interrupted due to quota limit.'})}\n\n"
                        break
                except queue.Empty:
                    continue
                    
        except Exception as e:
            logger.error(f"Streaming failed: {e}")
            yield f"data: {json.dumps({'type': 'error', 'data': 'Generation failed.'})}\n\n"

        gen_total_latency = time.time() - gen_start
        total_latency = round(time.time() - overall_start, 2)
        
        metrics = {
            "embedding_time": emb_latency,
            "retrieval_time": retrieval_latency,
            "prompt_construction_time": pc_latency,
            "ttft": round(ttft, 2) if ttft else 0,
            "model_processing_time": round(gen_total_latency, 2),
            "output_tokens": len(full_text) // 4,
            "total_latency": total_latency
        }
        
        # Extract all numbers from inside brackets (e.g. [4], [4, 7])
        used_citations = set()
        for bracket_content in re.findall(r'\[([^\]]+)\]', full_text):
            used_citations.update(re.findall(r'\d+', bracket_content))
        
        citations = []
        for i, chunk in enumerate(chunks):
            marker_num = str(i + 1)
            if marker_num in used_citations or not used_citations:
                meta = chunk.get("metadata", {})
                citations.append({
                    "marker": f"[{marker_num}]",
                    "text_snippet": chunk["document"][:150] + "...",
                    "source_name": get_canonical_source_name(meta),
                    "article_or_section": meta.get("section", meta.get("article", "Unknown")),
                    "legal_domain": meta.get("legal_domain", ""),
                    "metadata": meta,
                    "full_relevant_text": chunk["document"]
                })

        if task_type == "CIVIC":
            clean = full_text.strip()
            if clean.startswith('```json'): clean = clean[7:]
            elif clean.startswith('```'): clean = clean[3:]
            if clean.endswith('```'): clean = clean[:-3]
            clean = clean.strip()
            
            try:
                j = json.loads(clean)
                # False Success Detection
                empty_count = 0
                total_fields = 0
                
                # Check problemAndRights
                pr = j.get('problemAndRights', {})
                for k, v in pr.items():
                    total_fields += 1
                    if not v or "Not established" in str(v):
                        empty_count += 1
                        
                # Check authority
                ra = j.get('relevantAuthority', {})
                for k, v in ra.items():
                    total_fields += 1
                    if not v or "Not established" in str(v):
                        empty_count += 1
                        
                # If more than 60% of fields are "Not established" despite having user facts, reject it.
                if total_fields > 0 and (empty_count / total_fields) > 0.6:
                    logger.warning("Quality Gate Failed: High number of Not Established fields.")
                    yield f"data: {json.dumps({'type': 'error', 'data': 'SYNTHESIS_FAILURE: The system could not confidently establish the legal facts from the retrieved authority.'})}\n\n"
                    return
                else:
                    # Emit the whole validated JSON
                    yield f"data: {json.dumps({'type': 'chunk', 'data': clean})}\n\n"
            except Exception as e:
                logger.error(f"Failed to parse CIVIC JSON: {e}")
                yield f"data: {json.dumps({'type': 'error', 'data': 'SYNTHESIS_FAILURE: Failed to generate a structured case dossier.'})}\n\n"
                return

        yield f"data: {json.dumps({'type': 'complete', 'citations': citations, 'metrics': metrics})}\n\n"

    def _generate_with_fallback(self, system_instruction: str, user_prompt: str) -> tuple[str, float]:
        import time
        from app.core.config import settings
        max_retries = 2
        total_sleep_time = 0.0
        
        model_name = getattr(settings, "CIVIC_MODEL", "gemini-flash-lite-latest")
        
        for attempt in range(max_retries):
            try:
                current_key = key_rotator.get()
                temp_client = genai.Client(api_key=current_key)
                response = temp_client.models.generate_content(
                    model=model_name,
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                    ),
                )
                return response.text.strip(), total_sleep_time
            except Exception as e:
                error_str = str(e)
                logger.warning(f"RAG Generation failed on attempt {attempt+1}: {error_str}")
                
                if "GenerateRequestsPerDayPerProject" in error_str:
                    logger.warning("Daily quota exhausted, dropping key.")
                    key_rotator.remove_key(current_key)
                    continue
                elif "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    sleep_time = 0.5
                    time.sleep(sleep_time)
                    total_sleep_time += sleep_time
                continue
                
        return None, total_sleep_time

    def _fallback_response(self, message: str) -> Dict[str, Any]:
        return {
            "answer": message,
            "citations": [],
            "confidence": {
                "level": "Insufficient",
                "reason": message,
            },
            "metrics": {}
        }

rag_orchestrator = RAGOrchestrator()

