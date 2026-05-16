import requests
import json
import sseclient
from .config import get_api_key, get_api_url

def get_headers():
    api_key = get_api_key()
    if not api_key:
        raise ValueError("API Key is missing. Please run `mergeguard auth login` first.")
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

def create_review(pr_number: int, repository_id: int, full_repo_name: str, github_token: str, requester_id: int):
    url = f"{get_api_url()}/api/reviews"
    payload = {
        "prNumber": pr_number,
        "repositoryId": repository_id,
        "fullRepoName": full_repo_name,
        "githubToken": github_token,
        "requesterId": requester_id
    }
    response = requests.post(url, json=payload, headers=get_headers())
    response.raise_for_status()
    return response.json()

def get_review_stream(job_id: int):
    url = f"{get_api_url()}/api/reviews/{job_id}/stream"
    headers = get_headers()
    headers["Accept"] = "text/event-stream"
    
    response = requests.get(url, headers=headers, stream=True)
    response.raise_for_status()
    client = sseclient.SSEClient(response)
    return client

def submit_feedback(job_id: int, feedback: str):
    url = f"{get_api_url()}/api/reviews/{job_id}/feedback"
    payload = {"feedback": feedback}
    response = requests.post(url, json=payload, headers=get_headers())
    response.raise_for_status()
    return response.json()

def get_review(job_id: int):
    url = f"{get_api_url()}/api/reviews/{job_id}"
    response = requests.get(url, headers=get_headers())
    response.raise_for_status()
    return response.json()
