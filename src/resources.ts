import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

function quickstartContent(): string {
  return `# Obsidian MCP - Quickstart Guide

This MCP server provides 22 tools to read, write, search, and analyze an Obsidian vault.

## Tool categories

### Read
- list_notes(path?) - List note names and paths. Auto-compacted for large vaults.
- read_note(path) - Read full markdown content of a note.
- show_note(path) - Get metadata (tags, links, tasks, frontmatter) without reading content. Cheaper than read_note.
- get_vault_stats() - Vault-wide statistics: note count, tags, links, tasks.

### Write
- create_note(path, content, overwrite?) - Create a new note. Directories created automatically.
- edit_note(path, content) - Replace entire content of an existing note. Read the note first to avoid losing content.
- delete_note(path) - Permanently delete a note.
- delete_folder(path) - Delete a folder and all its contents.
- append_to_note(path, content) - Append content to the end of a note.

### Search
- search_notes(query, path?) - Full-text search with matching lines. Case-insensitive.
- search_by_tag(tag) - Find notes by hashtag (without # prefix).
- find_notes_by_name(pattern) - Find notes by filename substring.

### Graph
- get_backlinks(noteName) - Find notes linking to a given note via [[wiki-links]].
- get_outgoing_links(path) - Get all wiki-links from a note.
- get_graph() - Complete link graph with orphan detection.

### Tasks
- list_tasks(path?, status?) - List checkboxes, filterable by 'all', 'open', or 'done'.
- toggle_task(path, lineNumber) - Toggle a checkbox between done and open.

### Attachments
- list_attachments(orphansOnly?) - List non-markdown files with reference status.
- organize_attachments(folder?, deleteOrphans?) - Move attachments to a folder and update references.
- insert_image(path, imageData, fileName, caption?, line?, folder?) - Save base64 image and embed in a note.

### Meta
- discover_tools() - List all tools with short descriptions.
- get_tool_info(tool_name) - Detailed docs for a specific tool.

## Tips
- Use show_note instead of read_note when you only need metadata (tags, links, word count, frontmatter).
- Use path filters on list_notes, search_notes, and list_tasks to narrow results and avoid compaction.
- Large result sets (20+ items) are automatically compacted with a preview. Narrow your query for full results.
- insert_image supports PNG, JPEG, WebP, GIF up to 10MB. Data URI prefixes are stripped automatically.
- Tags in search_by_tag should not include the # prefix.
- get_graph and get_vault_stats read all notes and can be slow on large vaults.
`;
}

export function registerResources(server: McpServer): void {
  server.registerResource(
    "quickstart",
    "obsidian://quickstart",
    {
      title: "Obsidian Quickstart Guide",
      description: "Guide for using the Obsidian MCP server tools efficiently",
      mimeType: "text/plain",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: quickstartContent(),
        },
      ],
    }),
  );
}
