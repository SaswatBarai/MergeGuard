import httpx
import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

class GitHubService:
    def __init__(self, token: str):
        self.token = token
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json",
        }

    async def get_pr_diff(self, full_repo_name: str, pr_number: int) -> str:
        """
        Fetches the raw diff of a pull request.
        """
        url = f"{self.base_url}/repos/{full_repo_name}/pulls/{pr_number}"
        headers = {**self.headers, "Accept": "application/vnd.github.v3.diff"}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.text

    async def get_pr_files(self, full_repo_name: str, pr_number: int) -> List[Dict[str, Any]]:
        """
        Fetches the list of files changed in a pull request.
        """
        url = f"{self.base_url}/repos/{full_repo_name}/pulls/{pr_number}/files"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()

    async def get_file_content(self, full_repo_name: str, path: str, ref: str) -> str:
        """
        Fetches the content of a specific file at a specific ref.
        """
        url = f"{self.base_url}/repos/{full_repo_name}/contents/{path}?ref={ref}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            if response.status_code == 404:
                return ""
            response.raise_for_status()
            import base64
            content_b64 = response.json().get("content", "")
            return base64.b64decode(content_b64).decode("utf-8")
