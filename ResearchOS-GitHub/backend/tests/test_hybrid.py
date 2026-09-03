"""Smoke test for hybrid RRF fusion."""

from app.retrieval.hybrid import RetrievalHit, fuse_rrf, select_top


def test_fuse_rrf_merges_lists():
    semantic = [
        RetrievalHit("a", "d1", "alpha", 0.9),
        RetrievalHit("b", "d1", "beta", 0.8),
    ]
    lexical = [
        RetrievalHit("b", "d1", "beta", 0.95),
        RetrievalHit("c", "d2", "gamma", 0.7),
    ]
    fused = fuse_rrf(semantic, lexical)
    ids = [h.chunk_id for h in select_top(fused, 3)]
    assert "b" in ids
    assert len(ids) == 3
