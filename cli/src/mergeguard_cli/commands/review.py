import json
import os
import typer
from rich.prompt import Prompt
from .. import api, config
from ..ui import UI, console

review_app = typer.Typer()


@review_app.command("review")
def review_pr():
    """Start an AI code review — guided, no flags needed."""
    UI.title("MergeGuard — Start a Review")

    # ── Step 1: resolve the authenticated user ───────────────────────────────
    UI.step(1, 4, "Fetching your account…")
    try:
        me = api.get_me()
        UI.success(f"Signed in as {me['name']}")
    except Exception as e:
        UI.error(str(e))
        raise typer.Exit(1)

    # ── Step 2: pick a repository ────────────────────────────────────────────
    UI.step(2, 4, "Loading your repositories…")
    try:
        repos = api.get_my_repositories()
    except Exception as e:
        UI.error(f"Could not load repositories: {e}")
        raise typer.Exit(1)

    if not repos:
        UI.warn("No repositories found. Connect a repo via the dashboard first.")
        raise typer.Exit(1)

    console.print("\n  [dim]Available repositories:[/dim]")
    for i, r in enumerate(repos, 1):
        console.print(f"  [cyan]{i}[/cyan]  {r['fullName']}  [dim]({r.get('role', 'member')})[/dim]")
    console.print()

    while True:
        choice = Prompt.ask("  Select repository number")
        if choice.strip().isdigit() and 1 <= int(choice) <= len(repos):
            repo = repos[int(choice) - 1]
            break
        UI.error(f"Enter a number between 1 and {len(repos)}")

    # ── Step 3: PR number ────────────────────────────────────────────────────
    UI.step(3, 4, "Pull request details")
    while True:
        pr_input = Prompt.ask("  PR number")
        if pr_input.strip().isdigit() and int(pr_input) > 0:
            pr_number = int(pr_input.strip())
            break
        UI.error("Enter a positive integer")

    # ── Step 4: GitHub token ─────────────────────────────────────────────────
    UI.step(4, 4, "GitHub access token")

    stored_token = os.environ.get("GITHUB_TOKEN") or config.get_github_token()
    if stored_token:
        UI.success("GitHub token already saved — using stored token.")
        github_token = stored_token
    else:
        github_token = Prompt.ask(
            "  GitHub personal access token (needs repo read scope)",
            password=True,
        )
        if len(github_token.strip()) <= 5:
            UI.error("Token looks too short.")
            raise typer.Exit(1)
        config.set_github_token(github_token.strip())
        UI.dim("Token saved — you won't be asked again.")

    # ── Queue the review ─────────────────────────────────────────────────────
    UI.divider()
    UI.info(f"Queueing review for {repo['fullName']} PR #{pr_number}…")

    try:
        job = api.create_review(pr_number, repo["id"], repo["fullName"], github_token.strip(), me["id"])
    except Exception as e:
        UI.error(f"Failed to queue review: {e}")
        raise typer.Exit(1)

    job_id = job["id"]
    UI.success(f"Job #{job_id} queued! Connecting to live stream…")
    console.print(f"  View in browser → http://localhost:3004/dashboard/review/{job_id}\n")

    # ── Live SSE stream ──────────────────────────────────────────────────────
    try:
        client = api.get_review_stream(job_id)
        for event in client.events():
            if not event.data or event.data == ":":
                continue
            try:
                data = json.loads(event.data)
            except json.JSONDecodeError:
                continue

            event_type = data.get("type")

            if event_type == "agent_progress":
                agent = data.get("agentName") or data.get("agent") or "system"
                status = data.get("status", "")
                UI.dim(f"[{agent}] {status}")

                if status == "pending_feedback":
                    UI.warn(f"\n{agent} needs your feedback to continue.")
                    feedback = Prompt.ask("  Your feedback (or type 'Approve' to continue)")
                    api.submit_feedback(job_id, feedback)
                    UI.success("Feedback submitted!")

            elif event_type == "job_completed":
                UI.divider()
                UI.success("Review complete!")
                try:
                    final_job = api.get_review(job_id)
                    summary = (final_job.get("finalReport") or {}).get("synthesizedSummary")
                    if summary:
                        UI.display_report(summary)
                    else:
                        UI.warn("No summary was generated.")
                except Exception:
                    UI.warn("Could not fetch the final report.")

                UI.divider()
                console.print(f"  Full report → http://localhost:3004/dashboard/review/{job_id}\n")
                break

    except Exception as e:
        UI.error(f"Stream error: {e}")
        raise typer.Exit(1)
