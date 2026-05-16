from typing import Annotated, Dict, List, TypedDict, Union
import operator


class AgentFinding(TypedDict):
    agent_name: str
    content: str
    severity: str  # info, low, medium, high, critical
    file_path: Union[str, None]
    line_number: Union[int, None]


class ContextProfile(TypedDict):
    languages: List[str]
    frameworks: List[str]
    db_layer: Union[str, None]
    test_frameworks: List[str]
    system_type: str  # e.g., Web API, Library, CLI
    files_to_review: List[str]


class ReviewState(TypedDict):
    # Basic IDs
    job_id: int
    repository_id: int
    pr_number: int
    full_repo_name: str
    branch_name: str
    
    # Discovery data
    context_profile: Union[ContextProfile, None]
    pr_diff: str
    
    # Execution status
    status: str
    
    # Accumulated findings from different agents
    # operator.add allows us to append to the list rather than overwrite it
    findings: Annotated[List[AgentFinding], operator.add]
    
    # Track which agents have finished
    completed_agents: Annotated[List[str], operator.add]
    
    # Metadata and other info
    metadata: Dict[str, any]
