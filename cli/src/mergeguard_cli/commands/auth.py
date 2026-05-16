import typer
from rich.prompt import Prompt
from .. import config
from ..ui import UI

auth_app = typer.Typer(help="Authentication commands")

@auth_app.command("login")
def auth_login():
    """Configure your MergeGuard API Key."""
    UI.title("MergeGuard Authentication")
    api_key = Prompt.ask("Enter your API Key (from the Web Dashboard)", password=True)
    api_url = Prompt.ask("Enter the API Gateway URL", default=config.get_api_url())
    
    config.set_api_key(api_key)
    config.set_api_url(api_url)
    
    UI.success("Successfully authenticated!")
