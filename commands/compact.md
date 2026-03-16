---
description: Compact archived notes by summarizing their content
argument-hint: [--path] [--dry-run] [--days N]
---

Reduce vault size by summarizing content of archived/done notes that are no longer actively referenced.

Options:
- `--path`: Filter to a specific folder
- `--dry-run`: Preview candidates without modifying anything
- `--days N`: Minimum days since last update (default: 30)

## Finding candidates

1. Use `search_notes` with query `status::archived` to find archived notes
2. Also search `status::done` for completed notes
3. If `--path` given, filter by folder
4. For each candidate, check `get_property name=compacted` - skip if already compacted
5. Check `get_property name=updated` - skip if updated less than N days ago

## Dry run

If `--dry-run`, present candidates as a table without modifying:

| Note | Status | Last Updated | Content Size |
|------|--------|-------------|--------------|

Then ask if the user wants to proceed with compaction.

## Compaction

For each eligible note:
1. Read full content with `read_note`
2. Summarize the content while preserving:
   - All frontmatter (untouched)
   - Heading structure (h1, h2, h3)
   - Wiki-links (critical for graph integrity)
   - The `## Comments` section (if present)
3. Replace content with the summary using `edit_note`
4. Set `compacted` property to true: `set_property name=compacted value=true type=checkbox`
5. Update `updated` timestamp

## After compaction

Show summary:
- Number of notes compacted
- Approximate size reduction
- Remind the user this is permanent but recoverable via git history if the vault is versioned

## Warning

This operation is permanent. The original content is replaced with a summary. If the vault is tracked with git, the original can be recovered from git history. Always recommend `--dry-run` first.
