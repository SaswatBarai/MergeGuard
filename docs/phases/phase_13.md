## Phase 13: CLI Application (Python)

### Phase Overview
This phase builds the CLI interface for developers who prefer terminal-based workflows. It provides a robust, interactive terminal application to trigger reviews, watch live progress, and interact with the AI feedback loop without ever leaving the command line.

### Detailed Implementation Guide
1. **CLI Framework**: Initialize a Python CLI application using `Typer` for command routing and arguments, and `Rich` for stylized, color-coded terminal output.
2. **Authentication Management**: Implement an `auth login` command that prompts for the API Key (generated via the web dashboard) and saves it securely to a local configuration file (e.g., `~/.config/codereview/config.json`).
3. **Review Command**: Implement the `codereview --pr <id>` command. This command makes an authenticated REST HTTP call to the API Gateway to queue the job.
4. **Live Streaming**: Implement an SSE client to connect to the `/reviews/:id/stream` endpoint. Use `Rich` to render a live progress bar or status table that updates as agents complete.
5. **Interactive Feedback Loop**: When the SSE stream indicates the Summary Agent is waiting for feedback, use `Rich` prompts to display the summary in the terminal and ask the user for input (Approve, or type text feedback). Send this feedback back to the API via POST request.
6. **Final Output**: Render the final, approved markdown report beautifully in the terminal when the job completes.

### Tasks to complete
- Build the Typer + Rich CLI application.
- Implement `auth login` and config management.
- Implement the `codereview --pr <id>` command.
- Implement the logic to poll/stream SSE for real-time terminal output.
- Implement the interactive prompt for the human-in-the-loop feedback phase.

### Completion check
- [x] User can authenticate the CLI.
- [x] User can submit a PR for review, watch live progress in the terminal, provide feedback, and receive the final rendered markdown report.
