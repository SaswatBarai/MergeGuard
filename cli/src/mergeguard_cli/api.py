import json
import os
import requests
import sseclient
from .config import get_api_key, get_api_url


def _client() -> requests.Session:
    api_key = get_api_key()
    if not api_key:
        raise ValueError("Not authenticated. Run `mergeguard auth login` first.")
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"})
    s.base_url = get_api_url()  # type: ignore[attr-defined]
    return s


def _url(path: str) -> str:
    return f"{get_api_url()}{path}"


def get_me() -> dict:
    r = _client().get(_url("/auth/me"))
    r.raise_for_status()
    return r.json()


def get_my_repositories() -> list[dict]:
    r = _client().get(_url("/auth/me/repositories"))
    r.raise_for_status()
    return r.json()


def create_review(pr_number: int, repository_id: int, full_repo_name: str,
                  github_token: str, requester_id: int) -> dict:
    r = _client().post(_url("/reviews"), json={
        "prNumber": pr_number,
        "repositoryId": repository_id,
        "fullRepoName": full_repo_name,
        "githubToken": github_token,
        "requesterId": requester_id,
    })
    r.raise_for_status()
    return r.json()


def get_review_stream(job_id: int) -> sseclient.SSEClient:
    api_key = get_api_key()
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "text/event-stream",
    }
    r = requests.get(_url(f"/reviews/{job_id}/stream"), headers=headers, stream=True)
    r.raise_for_status()
    return sseclient.SSEClient(r)


def submit_feedback(job_id: int, feedback: str) -> dict:
    r = _client().post(_url(f"/reviews/{job_id}/feedback"), json={"feedback": feedback})
    r.raise_for_status()
    return r.json()


def get_review(job_id: int) -> dict:
    r = _client().get(_url(f"/reviews/{job_id}"))
    r.raise_for_status()
    return r.json()
