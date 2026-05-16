import typer
import json
import time
from rich.prompt import Prompt
from rich.progress import Progress, SpinnerColumn, TextColumn
from .. import api
from ..ui import UI

review_app = typer.Typer()

@review_app.command("review")
def review_pr(
    pr: int = typer.Option(..., "--pr", help="Pull Request Number"),
    repo_id: int = typer.Option(..., "--repo-id", help="Repository ID"),
    full_name: str = typer.Option(..., "--full-name", help="Repository Full Name (e.g., owner/repo)"),
    github_token: str = typer.Option(..., "--github-token", envvar="GITHUB_TOKEN", help="GitHub Token"),
    requester_id: int = typer.Option(..., "--requester-id", help="Requester User ID")
):
    """Trigger a new AI Code Review and watch its progress live."""
    try:
        UI.info(f"Queueing Review for PR #{pr}...")
        job = api.create_review(pr, repo_id, full_name, github_token, requester_id)
        job_id = job["id"]
        UI.success(f"Job #{job_id} successfully queued!")
        
        UI.info("Connecting to live stream...")
        client = api.get_review_stream(job_id)
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            transient=True,
        ) as progress:
            task_id = progress.add_task(description="Starting AI analysis...", total=None)
            
            for event in client.events():
                data = json.loads(event.data)
                event_type = data.get("type")
                
                if event_type == "agent_progress":
                    agent = data.get("agent", "System")
                    status = data.get("status", "")
                    progress.update(task_id, description=f"[{agent}] {status}...")
                    
                    if status == "pending_feedback":
                        progress.stop()
                        UI.warn(f"\nAgent {agent} is waiting for your feedback!")
                        feedback = Prompt.ask("Please provide your feedback (or type 'Approve' to continue)")
                        api.submit_feedback(job_id, feedback)
                        UI.success("Feedback submitted!")
                        progress.start()
                        progress.update(task_id, description=f"[{agent}] Resuming after feedback...")
                
                elif event_type == "job_completed":
                    progress.update(task_id, description="Review completed!")
                    break
        
        UI.success("\nReview finished successfully!")
        UI.info("Fetching final report...")
        
        time.sleep(1)
        final_job = api.get_review(job_id)
        
        report = final_job.get("finalReport")
        if report and report.get("synthesizedSummary"):
            UI.display_report(report["synthesizedSummary"])
        else:
            UI.warn("No summary was generated.")
            
    except Exception as e:
        UI.error(f"Error: {e}")
