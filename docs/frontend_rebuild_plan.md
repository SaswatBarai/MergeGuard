# Implementation Plan: A-Z Frontend Flow & UI Rebuild

## Objective
Rebuild everything in the frontend from A-Z from scratch. This includes a completely new landing page, authentication flow, dashboard, API key management, and live review interface using the premium "Enterprise Navy (Trust Dark)" theme.

## Background & Motivation
The current frontend lacks a complete, connected user journey and a polished aesthetic. The user requested a full UI/UX overhaul focusing on a modern, high-contrast design, while ensuring the entire flow is rebuilt and fully implemented from scratch. To prevent context loss ("hallucination") during development, the work will be strictly divided into 6 manageable phases.

## Scope & Impact
1. **End-to-End Frontend Flow (`packages/web-dashboard`):** 
   - **Landing Page (`/`):** A completely new, high-conversion landing page.
   - **Init/Auth Flow:** `/auth/login` (GitHub OAuth initiation), and Auth Callback handling.
   - **Dashboard Flow:** `/dashboard` for viewing review history and global statistics.
   - **Trigger Flow:** "Start Review" modal to initiate new jobs.
   - **Settings & API Keys Flow:** `/dashboard/settings` to allow users to generate, view, and revoke API keys needed for CLI authentication.
   - **Live Review Flow:** `/dashboard/review/[id]` to connect to the SSE stream, render live agent progress, and submit feedback.
   - **Theme Setup:** Global styling using Tailwind CSS v4 with a strict "Enterprise Navy" palette.

## Proposed Solution

### 1. The "Enterprise Navy" Theme
- **Palette:** Rich, deep blue/navy backgrounds (`#0f172a`), soft blue/indigo accents (`#3b82f6`), and high-contrast text (`#f8fafc`). Feels trustworthy, secure, and enterprise-ready.
- **Typography:** `Inter` for highly legible UI elements, `Poppins` for prominent headers.
- **Components:** Sharp or slightly rounded corners (`rounded-md`), subtle slate borders (`#334155`), and professional, airy data layouts.

### 2. Full Application Routing (The Flow)
- **`/`**: Landing page with "Get Started" routing to login.
- **`/auth/login`**: OAuth trigger screen.
- **`/auth-callback`**: JWT token capture and redirect to dashboard.
- **`/dashboard`**: Main control center (Recent reviews, Trigger new review).
- **`/dashboard/settings`**: API Key management interface (Generate/Revoke).
- **`/dashboard/review/[id]`**: Dedicated view for a single review's live progress and final output.

## 6-Phase Implementation Plan

### Phase 1: Foundation & Theme
- Rewrite `globals.css` with the "Enterprise Navy" Tailwind 4 theme.
- Setup base layout (`layout.tsx`), typography (`Inter`/`Poppins`), and global Redux/Query providers.
- Implement reusable UI primitives (Buttons, Inputs, Cards) adhering strictly to the new design system.

### Phase 2: Landing Page & Authentication
- Build the high-conversion Landing Page (`/`) with modern animations (Framer Motion).
- Implement the Login Page (`/auth/login`) with GitHub OAuth integration.
- Implement the Auth Callback logic (`/auth-callback`) and a client-side route protector hook to secure the dashboard routes.

### Phase 3: Dashboard Hub
- Build the main Dashboard layout (`/dashboard`) including the top navigation bar.
- Implement data fetching (TanStack Query) to display user-specific review history and global statistics.
- Create the "Live Review Card" component for listing recent jobs.

### Phase 4: Start Review Modal
- Build the modernized "Start Review" modal component.
- Integrate repository fetching and search filtering.
- Connect the form submission to the `api-gateway` to successfully trigger a new review job.

### Phase 5: Settings & API Keys
- Build the Settings layout (`/dashboard/settings`).
- Implement the UI to list active API Keys.
- Connect the frontend to the backend endpoints for generating new API Keys and revoking existing ones.

### Phase 6: Live Review & Feedback View
- Build the dynamic review page (`/dashboard/review/[id]`).
- Implement the SSE (Server-Sent Events) subscription to listen for real-time AI progress.
- Build the visual pipeline to display agent execution status.
- Implement the interactive human-in-the-loop "Feedback" modal.
- Render the final synthesized Markdown report upon completion.

## Verification
- Verify successful end-to-end user journey across all 6 phases: Landing -> Login -> Dashboard -> Generate API Key -> Trigger Review -> Watch Live Stream -> Submit Feedback -> View Report.
