import typer
from .ui import UI
from .commands.auth import auth_app
from .commands.review import review_app, review_pr

app = typer.Typer(help="MergeGuard CLI")

# Add sub-commands
app.add_typer(auth_app, name="auth")

# Register review command directly to the root for easier access
app.command(name="review", help="Trigger a new AI Code Review and watch its progress live")(review_pr)

def version_callback(value: bool):
    if value:
        UI.info("MergeGuard CLI v1.0.0")
        raise typer.Exit()

@app.callback()
def main(
    version: bool = typer.Option(None, "--version", callback=version_callback, is_eager=True, help="Show version and exit."),
):
    pass

if __name__ == "__main__":
    app()
