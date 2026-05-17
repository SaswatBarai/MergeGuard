import typer
from rich.prompt import Prompt, Confirm
from .. import config, api
from ..ui import UI, console

auth_app = typer.Typer(help="Authentication commands")


@auth_app.command("login")
def auth_login():
    """Authenticate with your MergeGuard API key."""
    UI.title("MergeGuard — Authentication")
    console.print("  Generate an API key at: http://localhost:3004/dashboard/settings\n")

    api_key = Prompt.ask("  Paste your API key", password=True)
    if len(api_key.strip()) <= 10:
        UI.error("Key looks too short — check and try again.")
        raise typer.Exit(1)

    api_url = Prompt.ask("  API gateway URL", default=config.get_api_url())
    try:
        from urllib.parse import urlparse
        r = urlparse(api_url)
        assert r.scheme and r.netloc
    except Exception:
        UI.error("Enter a valid URL (e.g. http://localhost:3000)")
        raise typer.Exit(1)

    config.set_api_key(api_key.strip())
    config.set_api_url(api_url.strip())

    console.print("\n  Verifying credentials…", end="")
    try:
        me = api.get_me()
        console.print("\r" + " " * 30 + "\r", end="")
        UI.success("Authenticated successfully!")
        UI.kv("Name", me["name"])
        UI.kv("Email", me["email"])
        UI.kv("User ID", str(me["id"]))
        print()
    except Exception:
        console.print("\r" + " " * 30 + "\r", end="")
        UI.warn("Key saved but verification failed — check the API URL and key.")


@auth_app.command("whoami")
def auth_whoami():
    """Show currently authenticated user."""
    if not config.get_api_key():
        UI.error("Not authenticated. Run `mergeguard auth login` first.")
        raise typer.Exit(1)
    try:
        me = api.get_me()
        UI.title("Authenticated as")
        UI.kv("Name", me["name"])
        UI.kv("Email", me["email"])
        UI.kv("User ID", str(me["id"]))
        UI.kv("API URL", config.get_api_url())
        UI.kv("GitHub token", "●●●● (saved)" if config.get_github_token() else "not set — will prompt on first review")
        print()
    except Exception:
        UI.error("Could not reach the API. Run `mergeguard auth login` again.")
        raise typer.Exit(1)


@auth_app.command("logout")
def auth_logout():
    """Remove stored credentials."""
    yes = Confirm.ask("  Remove stored API key and GitHub token?", default=False)
    if yes:
        config.clear_config()
        UI.success("Logged out. Run `mergeguard auth login` to re-authenticate.")
    else:
        UI.dim("Cancelled.")
