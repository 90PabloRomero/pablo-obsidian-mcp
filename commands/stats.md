---
description: Show vault statistics and health dashboard
argument-hint: [--path]
---

Display a comprehensive dashboard of vault statistics and health.

Optional: `--path` to filter stats to a specific folder.

## Gathering data

1. Call `get_vault_stats` for general metrics (total notes, tags, tasks, orphans, unresolved)
2. Search for breakdown by status using `search_notes`:
   - `status::open`
   - `status::in_progress`
   - `status::blocked`
   - `status::done`
   - `status::archived`
3. Search for breakdown by type using `search_notes`:
   - `type::project`
   - `type::moc`
   - `type::note`
   - `type::decision`
4. If `--path` was given, pass it as path filter to all searches

## Presentation

Present as a dashboard with these sections:

### Vault Overview
Total notes, folders, vault size.

### Notes by Status

| Status | Count |
|--------|-------|

### Notes by Type

| Type | Count |
|------|-------|

### Tasks
Open / Done / Total with completion percentage.

### Top Tags
Top 10 tags by count.

### Graph Health

| Metric | Count |
|--------|-------|
| Orphans (no backlinks) | X |
| Deadends (no outgoing links) | X |
| Unresolved links | X |

## Suggested actions

Based on the results, suggest relevant actions:
- Blocked notes exist -> `/obsidian:tasks-blocked`
- No in_progress work -> `/obsidian:tasks-ready`
- Orphan notes -> `/obsidian:links orphans`
- Unresolved links -> `/obsidian:links unresolved`
- Notes without tags -> `/obsidian:tag list-all`
