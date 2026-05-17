import json
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import box

console = Console()


class UI:
    @staticmethod
    def title(text: str) -> None:
        console.print(f"\n[bold cyan]{text}[/bold cyan]")

    @staticmethod
    def success(text: str) -> None:
        console.print(f"[green]✔[/green] [bold]{text}[/bold]")

    @staticmethod
    def info(text: str) -> None:
        console.print(f"[cyan]ℹ[/cyan] {text}")

    @staticmethod
    def warn(text: str) -> None:
        console.print(f"[yellow]⚠[/yellow] [bold]{text}[/bold]")

    @staticmethod
    def error(text: str) -> None:
        console.print(f"[red]✖[/red] [bold]{text}[/bold]")

    @staticmethod
    def dim(text: str) -> None:
        console.print(f"  [dim]{text}[/dim]")

    @staticmethod
    def divider() -> None:
        console.print(f"\n[dim]{'─' * 50}[/dim]\n")

    @staticmethod
    def step(n: int, total: int, text: str) -> None:
        console.print(f"[bold cyan][{n}/{total}][/bold cyan] {text}")

    @staticmethod
    def kv(key: str, value: str) -> None:
        console.print(f"  [dim]{key:<18}[/dim][white]{value}[/white]")

    @staticmethod
    def display_report(summary: str) -> None:
        try:
            data = json.loads(summary)
        except (json.JSONDecodeError, TypeError):
            console.print(Panel(summary, title="Final Report", expand=False))
            return

        recommendation = data.get("overall_recommendation", "—")
        color = "green" if recommendation.upper() == "APPROVE" else "red" if "REJECT" in recommendation.upper() else "yellow"

        console.print(Panel(
            f"[bold {color}]{recommendation}[/bold {color}]",
            title="[bold]Recommendation[/bold]",
            expand=False,
            box=box.ROUNDED,
        ))

        if data.get("executive_summary"):
            console.print(f"\n  [dim]Executive summary[/dim]")
            console.print(f"  {data['executive_summary']}\n")

        for section, label, color in [
            ("critical_blockers",    "Critical blockers",    "red"),
            ("important_suggestions","Important suggestions", "yellow"),
            ("minor_notes",          "Minor notes",          "dim"),
        ]:
            items = data.get(section) or []
            if items:
                console.print(f"  [{color}]{label}[/{color}]")
                for item in items:
                    console.print(f"  [{color}]·[/{color}] {item}")
                console.print()
