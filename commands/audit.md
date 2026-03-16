---
description: Audit vault health and find issues
argument-hint: [--fix]
---

Run a comprehensive audit of the vault to find potential issues.

Optional: `--fix` to automatically fix issues where possible.

## Checks

1. **Unresolved links**: Call `get_graph` to find wiki-links pointing to non-existent notes
2. **Orphan notes**: Notes with no backlinks (disconnected from the graph)
3. **Deadend notes**: Notes with no outgoing links
4. **Missing frontmatter**: Search for notes that lack type, status, or priority properties
5. **Stale notes**: Notes with `status::in_progress` but `updated` older than 14 days
6. **Empty notes**: Notes with no content beyond frontmatter
7. **Duplicate tags**: Tags that are semantically similar (e.g. "backend" vs "back-end")

## Strategy

1. Call `get_graph` for orphans, deadends, unresolved
2. Call `list_notes` to get all notes
3. For each note, call `show_note` to check frontmatter completeness
4. For stale check, compare `updated` property against current date
5. Compile findings into categories

## Output

Present findings grouped by category:

### Unresolved Links (X found)
- `[[missing-note]]` referenced in `source-note.md`

### Orphan Notes (X found)
- `lonely-note.md` - no backlinks

### Missing Frontmatter (X found)
- `note.md` - missing: type, priority

### Stale In-Progress (X found)
- `old-task.md` - last updated 30 days ago

## Auto-fix (--fix)

If `--fix` is given, offer to fix each category:
- Unresolved links: create the missing notes with `/obsidian:create`
- Missing frontmatter: set defaults with `set_property`
- Stale notes: ask to update status to blocked or done

Always confirm before applying fixes.

## Follow-ups

- Fix specific issues: `/obsidian:update`, `/obsidian:create`, `/obsidian:links`
- View full stats: `/obsidian:stats`
