from pydantic import BaseModel, Field


class ReviewJobRequested(BaseModel):
    jobId: int = Field(..., description="The unique ID of the review job")
    prNumber: int = Field(..., description="The pull request number")
    repositoryId: int = Field(..., description="The internal database ID of the repository")
    fullRepoName: str = Field(..., description="The full name of the repository (owner/repo)")
    branchName: str | None = Field(None, description="The branch name to review")
    githubToken: str = Field(..., description="The GitHub token to access the repository")
