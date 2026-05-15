from typing import Annotated, Dict, List, TypedDict, Union
import operator


class AgentFinding(TypedDict):
    agent_name: str
    content: str
    severity: str  # info, low, medium, high, critical
    file_path: Union[str, None]
    line_number: Union[int, None]


class ReviewState(TypedDict):
    # Basic IDs
    job_id: int
    repository_id: int
    pr_number: int
    branch_name: str
    
    # Execution status
    status: str
    
    # Accumulated findings from different agents
    # operator.add allows us to append to the list rather than overwrite it
    findings: Annotated[List[AgentFinding], operator.add]
    
    # Track which agents have finished
    completed_agents: Annotated[List[str], operator.add]
    
    # Metadata and other info
    metadata: Dict[str, any]
