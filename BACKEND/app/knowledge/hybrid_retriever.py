import logging
from typing import List, Dict, Any, Optional
from rank_bm25 import BM25Okapi
import nltk

# Ensure nltk punkt is downloaded for tokenization
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt', quiet=True)
    nltk.download('punkt_tab', quiet=True)

from app.knowledge.vector_store import vector_store
from app.knowledge.bm25_manager import bm25_manager

logger = logging.getLogger(__name__)

from app.core.config import settings

class HybridRetriever:
    def __init__(self):
        # We could cache BM25 indices here, keyed by tenant_id or document_id
        self._bm25_cache = {}
        self._corpus_cache = {}

    def search(self, query: str, query_embedding: List[float], n_results: int = 10, where: Optional[Dict[str, Any]] = None, predicted_domains: Dict[str, float] = None, document_type_priority: str = "any", domain_multiplier_weight: float = 0.10) -> List[Dict[str, Any]]:
        # 1. Dense Retrieval (ChromaDB) - Broaden to Top 20 for each collection
        initial_k = 20
        dense_results = vector_store.search(query_embedding, n_results=initial_k, where=where, search_sc=True)
        
        # 2. Fetch corpus and BM25 index from Manager
        tenant_id = "global"
        if where:
            if "tenant_id" in where:
                tenant_id = where["tenant_id"]
            elif "$and" in where:
                for cond in where["$and"]:
                    if "tenant_id" in cond:
                        tenant_id = cond["tenant_id"]
                        break

        bm25, corpus_ids, corpus_docs, corpus_metadatas = bm25_manager.get_index(tenant_id)
        
        if not bm25 or not corpus_docs:
            return dense_results[:n_results]

        tokenized_query = bm25_manager.tokenize_text(query)
        
        # Get BM25 scores
        bm25_scores = bm25.get_scores(tokenized_query)
        
        # 3. Reciprocal Rank Fusion (RRF) with Metadata Bonus
        rrf_scores = {}
        predicted_domains = predicted_domains or {}
        
        # Helper to calculate metadata multiplier
        def calculate_metadata_multiplier(metadata: Dict[str, Any]) -> float:
            multiplier = 1.0
            
            # Domain Match Bonus (Proportional to LLM confidence)
            chunk_domain = metadata.get("legal_domain", "")
            if chunk_domain in predicted_domains:
                multiplier += domain_multiplier_weight * predicted_domains[chunk_domain]
                
            # Document Type Bonus
            chunk_type = metadata.get("document_type", "")
            if document_type_priority != "any" and chunk_type == document_type_priority:
                multiplier += 0.05
                    
            return multiplier
        
        # Rank Dense
        for rank, res in enumerate(dense_results):
            chunk_id = res["id"]
            base_rrf = (1.0 / (60 + rank))
            multiplier = calculate_metadata_multiplier(res["metadata"])
            rrf_scores[chunk_id] = rrf_scores.get(chunk_id, 0) + (base_rrf * multiplier)
            
        # Rank Sparse (Top 30 from BM25)
        sparse_ranking = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)
        for rank, idx in enumerate(sparse_ranking[:30]):
            chunk_id = corpus_ids[idx]
            base_rrf = (1.0 / (60 + rank))
            
            # Avoid double-counting the multiplier if it was already seen in dense
            if chunk_id not in rrf_scores:
                multiplier = calculate_metadata_multiplier(corpus_metadatas[idx])
                rrf_scores[chunk_id] = (base_rrf * multiplier)
            else:
                rrf_scores[chunk_id] += (base_rrf * multiplier)
            
        # 4. Sort and apply Confidence Threshold
        sorted_rrf = sorted(rrf_scores.items(), key=lambda item: item[1], reverse=True)
        
        threshold = getattr(settings, "MIN_RETRIEVAL_THRESHOLD", 0.005)
        filtered_ids = [item[0] for item in sorted_rrf if item[1] >= threshold]
        
        # Take up to 20 for reranking
        top_ids = filtered_ids[:20]
        
        # Reconstruct the candidate list of dicts
        candidate_results = []
        for rank, cid in enumerate(top_ids):
            found_dense = None
            for res in dense_results:
                if res["id"] == cid:
                    found_dense = res
                    break
            
            is_sparse = False
            for idx in sparse_ranking[:30]:
                if corpus_ids[idx] == cid:
                    is_sparse = True
                    break
            
            retrieval_method = "hybrid" if (found_dense and is_sparse) else "dense" if found_dense else "sparse"
            
            if found_dense:
                found_dense["metadata"]["retrieval_method"] = retrieval_method
                found_dense["metadata"]["rrf_rank"] = rank + 1
                found_dense["metadata"]["rrf_score"] = rrf_scores[cid]
                candidate_results.append(found_dense)
            else:
                idx = corpus_ids.index(cid)
                candidate_results.append({
                    "id": cid,
                    "document": corpus_docs[idx],
                    "metadata": {
                        **corpus_metadatas[idx],
                        "retrieval_method": retrieval_method,
                        "rrf_rank": rank + 1,
                        "rrf_score": rrf_scores[cid]
                    },
                    "distance": 0.0 
                })
                
        # 5. Cross-Encoder Reranking
        if candidate_results:
            from app.knowledge.reranker import reranker_service
            # Rerank and return top N
            final_results = reranker_service.rerank(query, candidate_results, top_k=n_results)
        else:
            final_results = []
            
        return final_results


    def search_sc_only(self, query: str, query_embedding: List[float], n_results: int = 10, predicted_domains: Dict[str, float] = None) -> List[Dict[str, Any]]:
        initial_k = 30
        
        # 1. Build where clause for domain filtering
        where = None
        if predicted_domains:
            top_domain = max(predicted_domains.items(), key=lambda x: x[1])
            if top_domain[1] > 0.4:
                where = {"legal_domain": top_domain[0]}

        # 2. Dense search (search_sc=True pulls from SC collection via vector_store.py)
        dense_results = vector_store.search(query_embedding, n_results=initial_k, where=where, search_sc=True)
        dense_sc = [r for r in dense_results if 'SC_' in r['id'] or r['metadata'].get('court_level') == 'Supreme Court']
        
        # 3. BM25 Search
        bm25, corpus_ids, corpus_docs, corpus_metadatas = bm25_manager.get_index("global")
        bm25_sc = []
        if bm25 and corpus_docs:
            query_tokens = bm25_manager.tokenize_text(query)
            # Remove stopwords from query tokens so BM25 isn't dominated by generic terms
            stop_words = {"supreme", "court", "precedent", "judgment", "case", "law", "the", "a", "an", "is", "of", "and", "in", "to", "for", "with", "on", "by"}
            filtered_tokens = [t for t in query_tokens if t not in stop_words]
            if not filtered_tokens:
                filtered_tokens = query_tokens
                
            doc_scores = bm25.get_scores(filtered_tokens)
            top_bm25_indices = sorted(range(len(doc_scores)), key=lambda i: doc_scores[i], reverse=True)[:initial_k*2]
            
            for idx in top_bm25_indices:
                score = doc_scores[idx]
                if score <= 0: continue
                c_id = corpus_ids[idx]
                meta = corpus_metadatas[idx]
                # Filter by SC and Domain
                is_sc = 'SC_' in c_id or meta.get('court_level') == 'Supreme Court'
                if not is_sc: continue
                
                if where and "legal_domain" in where:
                    if meta.get("legal_domain") != where["legal_domain"]:
                        continue
                        
                bm25_sc.append({
                    "id": c_id,
                    "document": corpus_docs[idx],
                    "metadata": meta,
                    "bm25_score": score
                })
        
        # 4. RRF Merging
        merged = {}
        def add_to_rrf(results, score_field, method_name):
            for rank, res in enumerate(results):
                doc_id = res['id']
                if doc_id not in merged:
                    merged[doc_id] = {
                        "id": doc_id,
                        "document": res['document'],
                        "metadata": res['metadata'].copy(),
                        "rrf_score": 0.0,
                        "sources": []
                    }
                merged[doc_id]["rrf_score"] += 1.0 / (60 + rank + 1)
                merged[doc_id]["sources"].append(method_name)
                merged[doc_id]["metadata"]["retrieval_method"] = "+".join(merged[doc_id]["sources"])

        add_to_rrf(dense_sc, "distance", "dense")
        add_to_rrf(bm25_sc, "bm25_score", "bm25")
        
        candidate_results = sorted(list(merged.values()), key=lambda x: x["rrf_score"], reverse=True)
        
        # 5. Rerank
        if candidate_results:
            from app.knowledge.reranker import reranker_service
            ranked_sc = reranker_service.rerank(query, candidate_results, top_k=n_results)
            for chunk in ranked_sc:
                # Map reranker score to rrf_score to prevent truncation
                chunk["metadata"]["rrf_score"] = max(0.01, chunk["metadata"].get("reranker_score", 0.0))
            return ranked_sc
        return []

hybrid_retriever = HybridRetriever()

