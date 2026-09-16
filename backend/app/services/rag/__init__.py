"""
RAG helpers for resume analysis.
"""

from .knowledge_base import (
    KNOWLEDGE_DOCUMENTS,
    build_knowledge_base,
    compute_documents_hash,
    get_collection,
)
from .retriever import retrieve

__all__ = [
    "KNOWLEDGE_DOCUMENTS",
    "build_knowledge_base",
    "compute_documents_hash",
    "get_collection",
    "retrieve",
]
