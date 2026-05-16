import json
import logging
from typing import List, Dict, Any
from jinja2 import Environment, FileSystemLoader, select_autoescape
from langchain_anthropic import ChatAnthropic
from src.config import ANTHROPIC_API_KEY
from src.orchestrator.state import AgentFinding

logger = logging.getLogger(__name__)

# Setup Jinja2 environment
env = Environment(
    loader=FileSystemLoader("src/orchestrator/templates"),
    autoescape=select_autoescape()
)

class LLMService:
    def __init__(self):
        self.llm = ChatAnthropic(
            model="claude-3-sonnet-20240229",
            anthropic_api_key=ANTHROPIC_API_KEY,
            temperature=0
        )

    def _render_prompt(self, template_name: str, context: Dict[str, Any]) -> str:
        template = env.get_template(template_name)
        return template.render(**context)

    async def get_findings(self, agent_type: str, context_profile: Dict[str, Any], diff: str, user_feedback: str = None) -> List[AgentFinding]:
        template_map = {
            "security": "security.j2",
            "performance": "performance.j2",
            "testing": "testing.j2",
            "architecture": "architecture.j2",
            "readability": "readability.j2"
        }
        
        template_name = template_map.get(agent_type)
        if not template_name:
            logger.error("No template found for agent type: %s", agent_type)
            return []

        prompt = self._render_prompt(template_name, {
            "profile": context_profile, 
            "diff": diff,
            "user_feedback": user_feedback
        })
        
        try:
            # We use a simple prompt for now, but in a real scenario we'd use structured output features
            # Claude 3 is very good at following JSON instructions in the prompt.
            response = await self.llm.ainvoke(prompt)
            content = response.content
            
            # Basic JSON extraction from response
            # Claude might wrap JSON in backticks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            findings = json.loads(content)
            return findings
        except Exception as exc:
            logger.error("LLM invocation failed for %s: %s", agent_type, exc)
            return []

    async def get_summary(self, context_profile: Dict[str, Any], all_findings: Dict[str, List[AgentFinding]]) -> Dict[str, Any]:
        """
        Synthesizes all agent findings into a cohesive executive summary.
        """
        prompt = self._render_prompt("summary.j2", {
            "profile": context_profile, 
            "all_findings": all_findings
        })
        
        try:
            response = await self.llm.ainvoke(prompt)
            content = response.content
            
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            summary = json.loads(content)
            return summary
        except Exception as exc:
            logger.error("LLM summary generation failed: %s", exc)
            return {
                "executive_summary": "Failed to generate summary.",
                "overall_recommendation": "Comment",
                "critical_blockers": [],
                "important_suggestions": [],
                "minor_notes": []
            }
