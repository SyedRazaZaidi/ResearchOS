from app.retrieval.lexical import bm25_score, tokenize


def test_bm25_prefers_overlapping_terms():
    q = tokenize("hybrid retrieval hallucination")
    a = tokenize("hybrid retrieval reduces hallucination in RAG")
    b = tokenize("unrelated gardening tips and soil ph")
    assert bm25_score(q, a, 8) > bm25_score(q, b, 8)
