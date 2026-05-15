import os
from langchain_anthropic import ChatAnthropic
from dotenv import load_dotenv

load_dotenv()

def get_llm():
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        # For development/testing purposes if no key is provided
        # In a real scenario, this would raise an error or use a mock
        return None
    
    # Using the latest Claude 4.5 Sonnet as requested
    return ChatAnthropic(
        model="claude-sonnet-4-5",
        anthropic_api_key=api_key,
        temperature=0,
        max_tokens=4096
    )
