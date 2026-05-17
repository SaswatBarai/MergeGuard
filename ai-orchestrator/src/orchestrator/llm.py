import json
import logging
from typing import List, Dict, Any
from jinja2 import Environment, FileSystemLoader, select_autoescape
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from src.config import ANTHROPIC_API_KEY, GOOGLE_API_KEY, LLM_PROVIDER
from src.orchestrator.state import AgentFinding

logger = logging.getLogger(__name__)

# Setup Jinja2 environment
env = Environment(
    loader=FileSystemLoader("src/orchestrator/templates"),
    autoescape=select_autoescape()
)

class LLMService:
    def __init__(self):
        if LLM_PROVIDER == "anthropic":
            logger.info("Initializing Anthropic LLM (Claude 3.5 Sonnet)")
            self.llm = ChatAnthropic(
                model="claude-3-5-sonnet-20240620",
                anthropic_api_key=ANTHROPIC_API_KEY,
                temperature=0
            )
        elif LLM_PROVIDER == "google":
            logger.info("Initializing Google LLM (Gemini 2.5 Flash)")
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                google_api_key=GOOGLE_API_KEY,
                temperature=0
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {LLM_PROVIDER}")

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
            response = await self.llm.ainvoke(prompt)
            content = response.content.strip()
            
            # Basic JSON extraction from response
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            # Handle cases where the model might add text before or after the JSON array
            start_idx = content.find("[")
            end_idx = content.rfind("]")
            if start_idx != -1 and end_idx != -1:
                content = content[start_idx:end_idx+1]
            
            findings = json.loads(content)
            return findings
        except Exception as exc:
            logger.error("LLM invocation failed for %s: %s", agent_type, exc)
            return []

    async def get_summary(self, context_profile: Dict[str, Any], all_findings: Dict[Dict[str, Any], List[AgentFinding]]) -> Dict[str, Any]:
        """
        Synthesizes all agent findings into a cohesive executive summary.
        """
        prompt = self._render_prompt("summary.j2", {
            "profile": context_profile, 
            "all_findings": all_findings
        })
        
        try:
            response = await self.llm.ainvoke(prompt)
            content = response.content.strip()
            
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            # Handle cases where the model might add text before or after the JSON object
            start_idx = content.find("{")
            end_idx = content.rfind("}")
            if start_idx != -1 and end_idx != -1:
                content = content[start_idx:end_idx+1]
            
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
