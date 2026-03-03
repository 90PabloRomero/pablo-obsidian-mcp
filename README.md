# pablo-obsidian-mcp

MCP server for Obsidian vaults. Read, write, search, and analyze your notes from Claude Code (or any MCP client).

Built with [Bun](https://bun.sh) and the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk).

## Features

- **22 tools** for full vault management
- **Lazy discovery** - `discover_tools` + `get_tool_info` for efficient tool exploration
- **Auto-compaction** - large result sets are automatically compacted with previews to save context
- **Image insertion** - embed base64-encoded images (PNG, JPEG, WebP, GIF) directly into notes
- **Note metadata** - `show_note` returns tags, links, tasks, frontmatter without reading full content
- **Full-text search**, tag search, filename search
- **Wiki-link graph** with backlinks, outgoing links, orphan detection
- **Task management** - list, filter, and toggle checkboxes across the vault
- **Attachment management** - list, organize, and clean up non-markdown files

## Setup

### 1. Install dependencies

```bash
bun install
```

### 2. Configure in Claude Code

Add to your `~/.claude/settings.json` (or project `.claude/settings.json`):

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "bun",
      "args": ["run", "/path/to/pablo-obsidian-mcp/src/index.ts"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "/path/to/your/vault"
      }
    }
  }
}
```

### 3. Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OBSIDIAN_VAULT_PATH` | Yes | - | Absolute path to your Obsidian vault |
| `OBSIDIAN_COMPACTION_THRESHOLD` | No | `20` | Results above this count get compacted |
| `OBSIDIAN_PREVIEW_COUNT` | No | `5` | Number of items shown in compacted previews |

## Tools

### Meta (lazy discovery)

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

## Compaction

When a result set exceeds the threshold (default 20), the server returns a compacted response:

```json
{
  "compacted": true,
  "total": 847,
  "showing": 5,
  "preview": ["... first 5 items ..."],
  "hint": "Showing 5 of 847 notes. Use read_note for details, or narrow with path/query filters."
}
```

This prevents large vaults from burning through the LLM context window.

## License

MIT
