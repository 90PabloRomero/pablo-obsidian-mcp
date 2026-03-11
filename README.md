# pablo-obsidian-mcp

An MCP server that gives Claude Code (or any MCP client) full read/write access to your Obsidian vault. Search notes, manage tasks, analyze the wiki-link graph, and organize attachments -- all from your terminal.

Built with [Bun](https://bun.sh), [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk), and [Zod](https://zod.dev).

## Why

Obsidian stores everything as local markdown files, but AI coding assistants can't access them natively. This server bridges that gap: Claude can read your notes for context, create documentation as you work, search across hundreds of files instantly, and keep your vault organized -- without you ever leaving the terminal.

## Features

- **22 tools** across 7 categories (read, write, search, graph, tasks, attachments, meta)
- **Lazy discovery** -- tools are exposed via `discover_tools` + `get_tool_info` so the LLM only loads what it needs
- **Auto-compaction** -- large result sets (800+ notes) are automatically compacted with previews to save context window
- **Wiki-link graph** -- backlinks, outgoing links, full graph analysis, orphan detection
- **Task management** -- list and toggle checkboxes across the entire vault
- **Image insertion** -- embed base64-encoded images (PNG, JPEG, WebP, GIF) directly into notes
- **Metadata without content** -- `show_note` returns tags, links, tasks, frontmatter without reading the full file

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/90PabloRomero/pablo-obsidian-mcp.git
cd pablo-obsidian-mcp
bun install
```

### 2. Add to Claude Code

Add to `~/.claude/settings.json` (or project `.claude/settings.json`):

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/pablo-obsidian-mcp/src/index.ts"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "/absolute/path/to/your/vault"
      }
    }
  }
}
```

### 3. Use it

Once configured, Claude Code automatically discovers the tools. Ask it things like:

- *"Search my vault for notes about authentication"*
- *"Create a new note summarizing today's work"*
- *"Show me all incomplete tasks across my vault"*
- *"Which notes link to my architecture decisions note?"*

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OBSIDIAN_VAULT_PATH` | Yes | -- | Absolute path to your Obsidian vault |
| `OBSIDIAN_COMPACTION_THRESHOLD` | No | `20` | Results above this count get compacted |
| `OBSIDIAN_PREVIEW_COUNT` | No | `5` | Number of items shown in compacted previews |

## Tools

### Meta

| Tool | Description |
|------|-------------|
| `discover_tools` | List all 22 tools with short descriptions |
| `get_tool_info` | Get detailed docs for a specific tool |

### Read

| Tool | Description |
|------|-------------|
| `list_notes` | List note names and paths (auto-compacted for large vaults) |
| `read_note` | Read the full markdown content of a note |
| `show_note` | Get metadata (size, tags, links, tasks, frontmatter) without content |
| `get_vault_stats` | Vault-wide statistics |

### Write

| Tool | Description |
|------|-------------|
| `create_note` | Create a new markdown note |
| `edit_note` | Replace the entire content of a note |
| `delete_note` | Delete a note |
| `delete_folder` | Delete a folder and all its contents |
| `append_to_note` | Append content to the end of a note |

### Search

| Tool | Description |
|------|-------------|
| `search_notes` | Full-text search with matching lines |
| `search_by_tag` | Find notes by hashtag |
| `find_notes_by_name` | Find notes by filename substring |

### Graph

| Tool | Description |
|------|-------------|
| `get_backlinks` | Find notes linking to a given note |
| `get_outgoing_links` | Get all wiki-links from a note |
| `get_graph` | Complete link graph with orphan detection |

### Tasks

| Tool | Description |
|------|-------------|
| `list_tasks` | List all checkboxes, filterable by status |
| `toggle_task` | Toggle a checkbox between done and open |

### Attachments

| Tool | Description |
|------|-------------|
| `list_attachments` | List non-markdown files with reference status |
| `organize_attachments` | Move attachments to a folder and update references |
| `insert_image` | Save a base64 image and embed it in a note |

## How compaction works

When a result set exceeds the threshold (default 20), the server returns a compacted response instead of dumping everything into the context window:

```json
{
  "compacted": true,
  "total": 847,
  "showing": 5,
  "preview": ["... first 5 items ..."],
  "hint": "Showing 5 of 847 notes. Use read_note for details, or narrow with path/query filters."
}
```

This keeps token usage low even on vaults with thousands of notes. The LLM can then drill down into specific notes or narrow its search.

## Architecture

```
src/
  index.ts          -- MCP server entry point and tool registration
  vault.ts          -- Vault filesystem operations and path resolution
  parser.ts         -- Markdown parsing (frontmatter, wiki-links, tags, tasks)
  compact.ts        -- Auto-compaction logic for large result sets
  tools/
    meta.ts         -- discover_tools, get_tool_info
    read.ts         -- list_notes, read_note, show_note, get_vault_stats
    write.ts        -- create_note, edit_note, delete_note, delete_folder, append_to_note
    search.ts       -- search_notes, search_by_tag, find_notes_by_name
    graph.ts        -- get_backlinks, get_outgoing_links, get_graph
    tasks.ts        -- list_tasks, toggle_task
    attachments.ts  -- list_attachments, organize_attachments, insert_image
```

## License

MIT
