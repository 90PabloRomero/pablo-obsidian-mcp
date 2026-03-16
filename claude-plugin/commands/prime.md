---
description: Reload vault context after compaction or long sessions
---

Load vault context to restore awareness after context compaction or at the start of a long session.

## Steps

1. Call `get_vault_stats` for current vault overview
2. Use `search_notes` with query `status::in_progress` to find active work
3. Use `search_notes` with query `status::blocked` to find blockers
4. Present a compact summary:
   - Vault stats (notes, tasks, tags)
   - Active notes (in_progress) with their titles and priorities
   - Blocked notes if any
   - Frontmatter schema reminder
5. Remind that all vault operations should use obsidian MCP tools, not direct file access

## Output format

Keep it compact - this runs after compaction so context is limited:

```
Vault: <name> | <N> notes | <N> open tasks
Active: <list of in_progress notes with priority>
Blocked: <list or "none">
Schema: type|status|priority|assignee|tags|created|updated
Skills: /obsidian:<skill> for all operations
```

## When this runs

- Manually via `/obsidian:prime`
- Automatically via SessionStart hook (if configured in plugin.json)
- Automatically via PreCompact hook (if configured in plugin.json)
