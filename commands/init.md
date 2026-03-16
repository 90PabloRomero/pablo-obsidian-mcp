---
description: Initialize and verify connection to the Obsidian vault
---

Verify the Obsidian vault connection and show an overview of the current state.

Run these Obsidian CLI commands to gather vault info:

1. `obsidian version` - verify CLI is working
2. `obsidian vault` - show vault name and path
3. `obsidian files total` - total file count
4. `obsidian tags counts format=json` - all tags with counts
5. `obsidian tasks total` - total task count
6. `obsidian tasks done total` - completed tasks
7. `obsidian tasks todo total` - open tasks
8. `obsidian unresolved total` - broken links count
9. `obsidian orphans total` - notes with no incoming links
10. `obsidian templates` - available templates

After gathering stats, present a summary and show the standard frontmatter schema for managed notes:

```yaml
---
type: project | moc | note | decision
status: open | in_progress | blocked | done | archived
priority: 0-4 (0=critical, 1=high, 2=medium, 3=low, 4=backlog)
assignee: string (optional)
tags: []
created: ISO 8601
updated: ISO 8601
---
```

Then:
- Explain the basic workflow (or suggest running `/obsidian:workflow`)
- Suggest creating the first note with `/obsidian:create`

If the vault has already been used (notes exist), inform the user and show the stats summary.
