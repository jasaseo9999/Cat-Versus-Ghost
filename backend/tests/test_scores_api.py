"""Backend tests for Cat Versus Ghost score API."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or "https://ghost-tower-defense-1.preview.emergentagent.com"
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def test_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert "Cat Versus" in r.json().get("message", "")


def test_create_score_success(session):
    payload = {"name": "TEST_alpha", "score": 1234, "wave": 5, "kills": 10}
    r = session.post(f"{API}/scores", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["name"] == "TEST_alpha"
    assert d["score"] == 1234
    assert d["wave"] == 5
    assert d["kills"] == 10
    assert "id" in d and isinstance(d["id"], str)
    assert "created_at" in d
    assert "_id" not in d
    assert d.get("rank") is not None and d["rank"] >= 1


def test_create_score_empty_name(session):
    r = session.post(f"{API}/scores", json={"name": "", "score": 10, "wave": 1, "kills": 0})
    assert r.status_code == 422


def test_create_score_whitespace_name(session):
    r = session.post(f"{API}/scores", json={"name": "   ", "score": 10, "wave": 1, "kills": 0})
    assert r.status_code == 422


def test_create_score_long_name(session):
    r = session.post(f"{API}/scores", json={"name": "x" * 17, "score": 10, "wave": 1, "kills": 0})
    assert r.status_code == 422


def test_create_score_negative(session):
    r = session.post(f"{API}/scores", json={"name": "TEST_neg", "score": -5, "wave": 1, "kills": 0})
    assert r.status_code == 422


def test_list_scores_sorted_and_ranked(session):
    # add two more scores
    session.post(f"{API}/scores", json={"name": "TEST_high", "score": 999999, "wave": 30, "kills": 200})
    session.post(f"{API}/scores", json={"name": "TEST_low", "score": 1, "wave": 1, "kills": 0})
    r = session.get(f"{API}/scores?limit=50")
    assert r.status_code == 200
    lst = r.json()
    assert isinstance(lst, list) and len(lst) >= 2
    # sorted desc
    scores = [x["score"] for x in lst]
    assert scores == sorted(scores, reverse=True)
    # ranks
    for i, x in enumerate(lst):
        assert x["rank"] == i + 1
        assert "_id" not in x
        assert set(["id", "name", "score", "wave", "kills", "created_at", "rank"]).issubset(x.keys())


def test_list_scores_limit(session):
    r = session.get(f"{API}/scores?limit=2")
    assert r.status_code == 200
    assert len(r.json()) <= 2


def test_list_scores_invalid_limit(session):
    r = session.get(f"{API}/scores?limit=0")
    assert r.status_code == 422
