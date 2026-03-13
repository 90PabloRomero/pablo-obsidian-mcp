---
description: Find notes and tasks ready to work on (no blockers)
argument-hint: [--path] [--priority] [--assignee]
---

Find notes with open/in-progress status that have pending tasks, ready to be worked on.

Optional filters from arguments:
- `--path`: filter by folder (e.g. `--path Projects/`)
- `--priority`: filter by priority level (0-4)
- `--assignee`: filter by assignee

## Strategy

1. Use `search_notes` with query `status::open` to find open notes
2. Also search for `status::in_progress` and combine results
3. Exclude notes with `status::blocked`, `status::archived`, `status::done`
4. If `--path` was given, pass it as the path filter
5. For each matching note, call `list_tasks` with `todo=true` to count pending tasks
6. If `--priority` was given, filter by checking `get_property name=priority` on each note
7. If `--assignee` was given, filter by checking `get_property name=assignee` on each note

## Output

Present results as a table sorted by priority (0=critical first):

| Note | Type | Priority | Assignee | Open tasks |
|------|------|----------|----------|------------|

If no notes are found, inform the user and suggest:
- Check blocked notes: `/obsidian:tasks-blocked`
- Create a new note: `/obsidian:create`

## Follow-ups

If notes are found, ask which one the user wants to work on:
- View details: `/obsidian:show <path>`
- Start working (set status to in_progress): `/obsidian:update <path> status in_progress`
