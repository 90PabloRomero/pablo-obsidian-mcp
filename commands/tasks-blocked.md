---
description: Show notes with blocked status
argument-hint: [--path] [--assignee]
---

Find all notes that are currently blocked.

Optional filters from arguments:
- `--path`: filter by folder (e.g. `--path Projects/`)
- `--assignee`: filter by assignee

## Strategy

1. Use `search_notes` with query `status::blocked` to find blocked notes
2. If `--path` was given, pass it as the path filter
3. For each matching note, call `show_note` to get metadata (type, priority, assignee)
4. If `--assignee` was given, filter results by assignee property
5. Optionally use `search_context` to look for a "Blocked" section in the note content to surface the reason

## Output

Present results as a table sorted by priority (0=critical first):

| Note | Type | Priority | Assignee | Reason |
|------|------|----------|----------|--------|

The "Reason" column shows the first line after a `## Blocked` heading if found, otherwise "--".

If no blocked notes are found, inform the user and suggest:
- Check ready tasks: `/obsidian:tasks-ready`
- View all notes: `/obsidian:list`

## Follow-ups

If blocked notes are found:
- View details of a blocked note: `/obsidian:show <path>`
- Unblock a note by changing its status: `/obsidian:update <path> status open`
- If the blocker is resolved, suggest also removing the "Blocked" section from the note content
