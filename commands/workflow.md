---
description: Show the note management workflow guide
---

Display the obsidian workflow for AI agents and users.

# Obsidian Workflow

This MCP server manages Obsidian vaults with structured notes. Here's how to use it effectively:

## 1. Find Ready Work
Use `/obsidian:tasks-ready` to see notes with open status and pending tasks.

## 2. Start Working
Update the note status to in_progress:
- `/obsidian:update <path> status in_progress`

## 3. Work on It
Implement, research, or document. Use the vault as your knowledge base.

## 4. Discover New Work
As you work, you'll find related topics or tasks:
- Create notes: `/obsidian:create`
- Add comments: `/obsidian:comments <path> <text>`
- Link related notes with wiki-links: `[[related-note]]`

## 5. Complete the Task
When done, update status or archive:
- Mark done: `/obsidian:update <path> status done`
- Archive: `/obsidian:archive <path>`

## 6. Check What's Ready
After completing work, check for newly available tasks:
- `/obsidian:tasks-ready`
- Start the cycle again

## Tips
- **Priority levels**: 0=critical, 1=high, 2=medium, 3=low, 4=backlog
- **Note types**: project, moc, note, decision
- **Status flow**: open -> in_progress -> blocked/done -> archived
- **Wiki-links**: Use `[[note-name]]` to connect notes. `move_note` and `rename_note` update links automatically.
- **Tags**: Managed via frontmatter `tags` property (native list type)
- **Comments**: Added as Obsidian callouts in a `## Comments` section

## Frontmatter Schema
```yaml
---
type: project | moc | note | decision
status: open | in_progress | blocked | done | archived
priority: 0-4
assignee: string
tags: []
created: ISO 8601
updated: ISO 8601
---
```

## Available Skills
- `/obsidian:init` - Verify vault connection and show stats
- `/obsidian:create` - Create a new note with templates
- `/obsidian:list` - List notes with filters
- `/obsidian:show` - Show note metadata and context
- `/obsidian:update` - Update note properties
- `/obsidian:archive` - Archive a completed note
- `/obsidian:unarchive` - Restore an archived note
- `/obsidian:delete` - Delete a note
- `/obsidian:tasks-ready` - Find ready work
- `/obsidian:tasks-blocked` - Show blocked notes
- `/obsidian:links` - Explore wiki-link graph
- `/obsidian:moc` - Manage Maps of Content
- `/obsidian:search` - Search vault content
- `/obsidian:comments` - Add/view comments
- `/obsidian:tag` - Manage tags
- `/obsidian:stats` - Vault statistics dashboard
- `/obsidian:compact` - Compact old notes
- `/obsidian:restore` - Restore compacted notes
- `/obsidian:export` - Export to JSONL
- `/obsidian:import` - Import from JSONL
- `/obsidian:sync` - Sync vault
- `/obsidian:workflow` - Show this guide

## MCP Tools Available
Use these via the obsidian MCP server:
- `list_notes`, `read_note`, `show_note`, `get_vault_stats`
- `create_note`, `edit_note`, `delete_note`, `append_to_note`, `prepend_to_note`
- `move_note`, `rename_note`
- `set_property`, `get_property`, `remove_property`
- `search_notes`, `search_context`, `search_by_tag`, `find_notes_by_name`
- `get_backlinks`, `get_outgoing_links`, `get_graph`
- `list_tasks`, `toggle_task`
- `list_attachments`, `insert_image`
- `discover_tools`, `get_tool_info`
