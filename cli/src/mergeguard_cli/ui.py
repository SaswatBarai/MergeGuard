from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown

console = Console()

class UI:
    @staticmethod
    def title(text: str):
        console.print(f"[bold cyan]{text}[/bold cyan]")

    @staticmethod
    def success(text: str):
        console.print(f"[bold green]{text}[/bold green]")

    @staticmethod
    def info(text: str):
        console.print(f"[bold cyan]{text}[/bold cyan]")

    @staticmethod
    def warn(text: str):
        console.print(f"[bold yellow]{text}[/bold yellow]")

    @staticmethod
    def error(text: str):
        console.print(f"[bold red]{text}[/bold red]")

    @staticmethod
    def display_report(summary: str):
        console.print(Panel(Markdown(summary), title="Final AI Review Report", expand=False))
