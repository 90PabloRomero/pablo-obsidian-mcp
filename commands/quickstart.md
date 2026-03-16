---
description: Quick start guide for first-time setup
---

Display the quickstart guide for setting up and using the obsidian MCP server.

# Obsidian MCP - Quick Start

## Prerequisites

1. **Obsidian** desktop app must be running
2. **Obsidian CLI** installed (`obsidian version` should work)
3. **Bun** runtime installed

## Installation

Install the plugin in Claude Code:
```
/install 90PabloRomero/pablo-obsidian-mcp
```

This sets up both the MCP server and all `/obsidian:*` skills automatically.

## Verify Connection

Run `/obsidian:init` to verify everything works. You should see:
- Vault name and path
- File count and folder count
- Tags and task statistics
- Available templates

## Create Your First Note

```
/obsidian:create Projects/my-project.md
```

This creates a structured note with frontmatter:
```yaml
---
type: project
status: open
priority: 2
tags: []
created: 2026-03-15T00:00:00
updated: 2026-03-15T00:00:00
---
```

## Frontmatter Schema

All managed notes use this schema:

| Property | Type | Values |
|----------|------|--------|
| type | text | project, moc, note, decision |
| status | text | open, in_progress, blocked, done, archived |
| priority | number | 0=critical, 1=high, 2=medium, 3=low, 4=backlog |
| assignee | text | free string |
| tags | list | list of tags |
| created | datetime | ISO 8601 |
| updated | datetime | ISO 8601 |

## Essential Skills

| Skill | What it does |
|-------|-------------|
| `/obsidian:init` | Verify vault and show stats |
| `/obsidian:create` | Create a note |
| `/obsidian:list` | List notes with filters |
| `/obsidian:show` | Show note metadata |
| `/obsidian:update` | Update properties |
| `/obsidian:search` | Search vault content |
| `/obsidian:workflow` | Full workflow guide |

## Next Steps

Run `/obsidian:workflow` to learn the full work cycle.
