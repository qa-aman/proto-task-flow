# Backend and Database Structure Prompt

Here's a single, copy-pasteable prompt you can give to any backend/database AI to produce the full backend and database structure for your Task Management Tool. It encodes everything covered by your current UI and the constrained reporting requirements.

Copy-paste prompt starts below:

You are a top 1% backend architect. Design a production-ready backend and database for a Task Management Tool whose UI and flows are defined as follows. Generate:

- SQL DDL (PostgreSQL 15+). Include enums, tables, constraints, indexes, and comments. Use snake_case.
- RLS policies for secure multi-tenant access (organizations), with roles Owner, Manager, Employee.
- Triggers and functions for time aggregation, status auditing, and data integrity.
- REST/RPC API endpoints (or Supabase RPCs) with request/response payloads.
- Example queries for daily/weekly/monthly reports (member, project, task).
- Storage buckets/paths for attachments with signed URL patterns.
- Minimal seed data for local dev.
- Clear acceptance tests and operational notes (backups, indexes, refresh of materialized views).

Scope and constraints from the UI

- Users navigate: Project List, Task Board, Employee Dashboard, Manager Dashboard, Owner Dashboard.
- Entities and key fields:
  - Organization (multi-tenant boundary).
  - User (linked to auth identity), Team, Membership (role: owner, manager, employee).
  - Project: name, description, status, optional start_date, optional end_date/deadline, archived_at nullable; Owner and member assignments; supports sub-projects.
  - SubProject: hierarchical grouping under Project, optional dates.
  - Task: title, description, status ∈ {open, in_progress, blocked, done}, priority ∈ {low, medium, high, critical}, assignee nullable, optional start_date, optional due_date, estimated_seconds nullable, total_time_spent_seconds (maintained via triggers), attachments, comments, activity log.
  - Comment: threaded (parent_comment_id nullable), rich text plain content, created_by.
  - Attachment: file metadata (path, content_type, size), belongs to task or comment.
  - TimeEntry: user_id, task_id, started_at (timestamptz), ended_at nullable (for running timers), duration_seconds computed; store timestamps in UTC, display in user TZ.
  - TaskStatusChange (audit trail): task_id, from_status, to_status, changed_by, changed_at.
- Optional dates rule: Task and Project start_date and end_date are optional (nullable). No "Invalid Date" rendering should occur for nulls.
- Project persistence rule: A created project remains visible until explicitly archived or deleted. Model soft-delete via archived_at; do not auto-remove.
- Reporting toggles and drill-down requirements:
  - Time Spent Reports (Team Member view): For each member, show totals and breakdowns by day/week/month across:
    - Overall total (all projects)
    - Per project
    - Per task
  - Project Time Reports: For each project, show:
    - Total overall time
    - Total per member
    - Breakdowns by day/week/month
  - Task Time Reports:
    - Optional start_date
    - Optional end_date
    - Aggregated total time spent
  - Clickability: Every row/metric is drill-down-capable:
    - Project row → project board
    - Member row → member view (their tasks and time)
    - Task row → task detail
- Out of scope: Notifications; billing/invoicing/payroll; analytics beyond the reports above; new dashboards beyond Owner, Manager, Employee.

Database design requirements

- Enums:
  - role_enum: owner, manager, employee
  - task_status_enum: open, in_progress, blocked, done
  - priority_enum: low, medium, high, critical
  - project_status_enum: planned, in_progress, blocked, done, on_hold (map UI badges to these)
- Tables (all tenant-owned tables include org_id UUID not null; FK to organizations; add created_at, updated_at):
  - organizations(id, name, created_at)
  - users(id UUID, auth_user_id UUID, email, name, avatar_url nullable)
  - teams(id, org_id, name)
  - memberships(id, org_id, user_id, team_id nullable, role role_enum)
  - projects(id, org_id, name, description, status project_status_enum default 'planned', start_date date nullable, end_date date nullable, archived_at timestamptz nullable, owner_id user_id)
  - project_members(id, org_id, project_id, user_id, role_in_project text nullable)
  - sub_projects(id, org_id, project_id, name, description nullable, start_date date nullable, end_date date nullable)
  - tasks(id, org_id, project_id, sub_project_id nullable, title, description, status task_status_enum default 'open', priority priority_enum default 'medium', assignee_id nullable, start_date date nullable, due_date date nullable, estimated_seconds int nullable, total_time_spent_seconds bigint default 0, created_by, archived_at nullable)
  - time_entries(id, org_id, task_id, user_id, started_at timestamptz not null, ended_at timestamptz nullable, duration_seconds int generated or maintained by trigger; note: ended_at >= started_at; prevent overlaps per user)
  - comments(id, org_id, task_id, parent_comment_id nullable, body text, created_by, edited_at nullable)
  - attachments(id, org_id, task_id nullable, comment_id nullable, storage_path text, content_type text, size_bytes int, uploaded_by)
  - task_status_changes(id, org_id, task_id, from_status task_status_enum, to_status task_status_enum, changed_by, changed_at)
- Constraints and integrity:
  - FK indexes on all relationships.
  - Exclusion or trigger-based check to prevent overlapping time_entries per user (period overlaps).
  - duration_seconds = greatest(extract(epoch from coalesce(ended_at, now()) - started_at), 0).
  - Trigger on time_entries insert/update/delete to increment/decrement tasks.total_time_spent_seconds.
  - Validate attachments refer to either task_id or comment_id, not both null.
  - Partial unique indexes to exclude archived rows where needed.
- Indexing strategy:
  - time_entries: (task_id, started_at), (user_id, started_at), (org_id, started_at), (project_id via join through task) for time-series queries.
  - tasks: (project_id, status), (assignee_id, status), (org_id, archived_at) partial on archived_at is null.
  - projects: (org_id, status), (org_id, archived_at) partial on archived_at is null.
  - comments: (task_id, created_at).
- RLS model:
  - Enable RLS on all tenant tables; default deny.
  - Attach org_id to jwt session via claims; policies restrict rows by org_id.
  - Owner: full org access (select/insert/update/delete) on all org rows.
  - Manager: read all org rows; write on projects/tasks/comments/time_entries where they are project owner/member or team manager; can manage members in their projects.
  - Employee: read projects they're a member of and tasks assigned to them; can insert/update/delete their own time_entries and comments; update tasks they are assigned (limited fields like status).
  - Storage: one bucket task_attachments; policy allows org members; access via signed URLs only.
- Reporting functions (RPCs or SQL functions; SECURITY DEFINER with explicit org/role checks):
  - fn_time_report_member(period text in ['day', 'week', 'month'], org_id uuid, user_id uuid null, team_id uuid null, start_date date null, end_date date null)
    - Returns: periods with total_seconds, plus breakdown arrays: per_project [{project_id, name, total_seconds}], per_task [{task_id, title, project_id, total_seconds}].
  - fn_time_report_project(period, org_id, project_id, start_date, end_date)
    - Returns: periods with project_total_seconds and per_member [{user_id, name, total_seconds}].
  - fn_time_report_task(period, org_id, task_id, start_date, end_date)
    - Returns: periods with task_total_seconds.
  - Implementation details: use date_trunc(period, started_at) grouping; include entries where started_at within [start_date, end_date] if provided; otherwise default rolling windows (e.g., last 30/90 days) suitable for UI.
- Materialized views (optional optimization for scale):
  - mv_member_time_daily(org_id, user_id, project_id, task_id, day date, total_seconds)
  - mv_project_time_daily(org_id, project_id, user_id, day, total_seconds)
  - mv_task_time_daily(org_id, task_id, day, total_seconds)
  - Index on (org_id, day) and (org_id, project_id, day).
  - Provide REFRESH MATERIALIZED VIEW CONCURRENTLY procedures and suggested schedules.
- API surface (REST-ish; adapt to platform):
  - Projects:
    - GET /projects?archived=false
    - POST /projects
    - PATCH /projects/:id
    - POST /projects/:id/archive
    - GET /projects/:id/members
    - POST /projects/:id/members
  - Tasks:
    - GET /projects/:id/tasks
    - POST /projects/:id/tasks
    - GET /tasks/:id
    - PATCH /tasks/:id (status, priority, assignee, dates, estimate)
    - POST /tasks/:id/comments
    - POST /tasks/:id/attachments (returns signed upload URL)
  - Time entries:
    - GET /tasks/:id/time-entries
    - POST /tasks/:id/time-entries (start/stop or explicit interval)
    - PATCH /time-entries/:id
    - DELETE /time-entries/:id
  - Reports:
    - GET /reports/member?period=day|week|month&user_id=&team_id=&start_date=&end_date=
    - GET /reports/project?period=day|week|month&project_id=&start_date=&end_date=
    - GET /reports/task?period=day|week|month&task_id=&start_date=&end_date=
  - All list endpoints support pagination (limit, cursor) and sorting; all endpoints enforce org/role via RLS or middleware.
- Storage (attachments):
  - Bucket: task_attachments
  - Path: org_id/project_id/task_id/{uuid}.{ext}
  - Signed URL: 10–60 minutes validity; MIME whitelist; size limits; AV scanning optional.
- Seed data:
  - One org with Owner, one Manager, two Employees.
  - Two projects (one with sub-projects).
  - 6–10 tasks with mixed statuses, priorities, optional dates.
  - 20–50 time_entries distributed to support daily/weekly/monthly reporting examples.
- Acceptance tests:
  - Creating a project persists it; listing projects with archived=false includes it until archived/deleted.
  - Optional dates can be null and never break queries.
  - Reports:
    - Member report returns totals + per project + per task for day/week/month.
    - Project report returns overall + per member for day/week/month.
    - Task report returns aggregated totals with optional date window.
  - Drill downs:
    - Report rows include ids and names to navigate to project, task, or member.
  - RLS:
    - Employee cannot read projects outside their org or where not a member.
    - Employee can only mutate their own time_entries.
    - Manager can manage tasks/time for their projects.
    - Owner can do everything within org.
- Operational notes:
  - Timestamps in UTC; convert at edge/UI.
  - Backups daily; PITR enabled.
  - Analyze/vacuum and index maintenance schedule.
  - Monitoring slow queries; ensure covering indexes for report GROUP BY.
  - For high write volume, favor append-only time_entries and periodic aggregation.

Deliverables to generate now

1) SQL: CREATE TYPEs, CREATE TABLEs, all FKs, NOT NULLs, defaults, CHECKs, indexes, RLS enablement, policies, triggers, and functions (including reporting RPCs).
2) API docs: For each endpoint/RPC, specify method, path/name, auth, params, request/response JSON, error codes.
3) Example SQL queries for each report and drill-down.
4) Storage bucket and policy definitions, signed URL flow.
5) Seed SQL script with sample org, users, projects, tasks, time_entries.

End of prompt.