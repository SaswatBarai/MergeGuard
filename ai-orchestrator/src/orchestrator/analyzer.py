import logging
from typing import List, Dict, Any
from src.orchestrator.state import ContextProfile
from src.orchestrator.discovery_rules import DETECTION_RULES

logger = logging.getLogger(__name__)

def analyze_context(files: List[Dict[str, Any]]) -> ContextProfile:
    """
    Analyzes the file list to infer the technical context using generic rules.
    """
    detected = {
        "languages": set(),
        "frameworks": set(),
        "db_layer": None,
        "test_frameworks": set(),
    }
    
    file_names = [f["filename"] for f in files]

    for category, rules in DETECTION_RULES.items():
        for tech_name, patterns in rules.items():
            matched = False
            for pattern in patterns:
                for fname in file_names:
                    # Extension match (e.g., ".py")
                    if pattern.startswith(".") and fname.endswith(pattern):
                        matched = True
                    # Exact filename match (e.g., "package.json")
                    elif pattern == fname:
                        matched = True
                    # Substring match (e.g., "prisma", "pytest")
                    elif pattern in fname.lower():
                        matched = True
                    
                    if matched:
                        break
                if matched:
                    break
            
            if matched:
                if category == "db_layer":
                    # For db_layer, we record the first one detected as primary
                    if not detected[category]:
                        detected[category] = tech_name
                else:
                    detected[category].add(tech_name)

    return {
        "languages": list(detected["languages"]),
        "frameworks": list(detected["frameworks"]),
        "db_layer": detected["db_layer"],
        "test_frameworks": list(detected["test_frameworks"]),
        "system_type": "Generic Web App",
        "files_to_review": file_names
    }
