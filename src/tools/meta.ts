import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const TOOL_CATALOG: Record<string, string> = {
  discover_tools: "List all available tools with short descriptions",
  get_tool_info: "Get detailed docs for a specific tool",
  list_notes: "List note names and paths (compacted for large vaults)",
  read_note: "Read the full markdown content of a note",
  show_note: "Get note metadata (properties, tags, outline, backlinks, tasks) without content",
  get_vault_stats: "Vault-wide statistics: notes, tags, tasks, orphans, unresolved links",
  create_note: "Create a new markdown note (supports templates)",
  edit_note: "Replace the entire content of an existing note",
  delete_note: "Delete a note (moves to trash by default)",
  delete_folder: "Delete a folder and all its contents",
  append_to_note: "Append content to the end of a note",
  prepend_to_note: "Prepend content after frontmatter of a note",
  move_note: "Move or rename a note (auto-updates wiki-links)",
  rename_note: "Rename a note (auto-updates wiki-links)",
  set_property: "Set a frontmatter property with native typing",
  get_property: "Read a frontmatter property value",
  remove_property: "Remove a frontmatter property",
  search_notes: "Search vault text (supports property syntax like status::open)",
  search_context: "Search with matching line context (grep-style)",
  search_by_tag: "Find all notes containing a specific tag",
  find_notes_by_name: "Find notes by filename substring match",
  get_backlinks: "Find notes that link to a given note",
  get_outgoing_links: "Get all outgoing links from a note",
  get_graph: "Get orphans, deadends, and unresolved links",
  list_tasks: "List task checkboxes with status filters",
  toggle_task: "Toggle a task checkbox",
  list_attachments: "List non-markdown files in the vault",
  insert_image: "Insert a base64 image into a note as an attachment",
};

interface ToolDetail {
  description: string;
  parameters: Record<string, string>;
  returns: string;
  tips: string[];
}

const TOOL_DETAILS: Record<string, ToolDetail> = {
  discover_tools: {
    description: "Returns a catalog of all tools with one-line descriptions.",
    parameters: {},
    returns: "Object mapping tool names to descriptions",
    tips: ["Call once at the start of a session", "Use get_tool_info for details on specific tools"],
  },
  get_tool_info: {
    description: "Returns detailed documentation for a single tool.",
    parameters: { tool_name: "Name of the tool to get info about" },
    returns: "Detailed tool documentation object",
    tips: ["Use discover_tools first to see available tools"],
  },
  list_notes: {
    description: "Lists all markdown notes in the vault or a subfolder via Obsidian CLI.",
    parameters: { path: "(optional) Subfolder to filter" },
    returns: "Array of {name, path} or compacted result with preview",
    tips: ["Use path filter to narrow results in large vaults", "Use read_note to get content, show_note for metadata"],
  },
  read_note: {
    description: "Reads the full markdown content of a single note via Obsidian CLI.",
    parameters: { path: "Path to the note relative to vault root" },
    returns: "Full markdown content as text",
    tips: ["Use show_note first if you only need metadata", "Path should include .md extension"],
  },
  show_note: {
    description: "Returns rich metadata about a note WITHOUT reading the full content. Uses multiple CLI commands for properties, tags, outline, backlinks, and tasks.",
    parameters: { path: "Path to the note relative to vault root" },
    returns: "Object with fileInfo, tags, properties, outline, backlinks, outgoingLinks, tasks",
    tips: ["Cheaper than read_note for exploration", "Properties are returned with native Obsidian typing"],
  },
  get_vault_stats: {
    description: "Returns vault-wide statistics using Obsidian CLI.",
    parameters: {},
    returns: "Object with vault info, noteCount, tags with counts, taskStats, unresolvedLinks, orphanNotes",
    tips: ["Uses indexed data from Obsidian, much faster than file scanning"],
  },
  create_note: {
    description: "Creates a new note via Obsidian CLI. Supports native templates.",
    parameters: { path: "Path for the new note", content: "(optional) Markdown content", template: "(optional) Template name", overwrite: "(optional) Overwrite if exists" },
    returns: "Confirmation message",
    tips: ["Use template parameter to use Obsidian's native templates", "Directories are created automatically"],
  },
  edit_note: {
    description: "Replaces the entire content of an existing note.",
    parameters: { path: "Path to the note", content: "New markdown content" },
    returns: "Confirmation message",
    tips: ["Read the note first to avoid losing content"],
  },
  delete_note: {
    description: "Deletes a note. Moves to trash by default.",
    parameters: { path: "Path to the note", permanent: "(optional) Skip trash" },
    returns: "Confirmation message",
    tips: ["Set permanent=true to skip trash"],
  },
  delete_folder: {
    description: "Deletes a folder and all notes inside it.",
    parameters: { path: "Path to the folder", permanent: "(optional) Skip trash" },
    returns: "Confirmation message",
    tips: ["This includes all nested subfolders"],
  },
  append_to_note: {
    description: "Appends content to the end of an existing note via CLI.",
    parameters: { path: "Path to the note", content: "Content to append" },
    returns: "Confirmation message",
    tips: ["Automatically handles newline separation"],
  },
  prepend_to_note: {
    description: "Prepends content after frontmatter of a note via CLI.",
    parameters: { path: "Path to the note", content: "Content to prepend" },
    returns: "Confirmation message",
    tips: ["Content is inserted after frontmatter, not at the very beginning"],
  },
  move_note: {
    description: "Moves or renames a note. Obsidian automatically updates all internal wiki-links.",
    parameters: { path: "Current path", to: "Destination path" },
    returns: "Confirmation message",
    tips: ["Wiki-links are updated automatically by Obsidian"],
  },
  rename_note: {
    description: "Renames a note. Obsidian automatically updates all internal wiki-links.",
    parameters: { path: "Path to the note", name: "New name" },
    returns: "Confirmation message",
    tips: ["Extension is preserved automatically if omitted"],
  },
  set_property: {
    description: "Sets a frontmatter property on a note with native Obsidian typing.",
    parameters: { path: "Path to the note", name: "Property name", value: "Property value", type: "(optional) text|list|number|checkbox|date|datetime" },
    returns: "Confirmation message",
    tips: ["Use type parameter for proper typing", "Great for structured metadata like status, priority, type"],
  },
  get_property: {
    description: "Reads a frontmatter property value from a note.",
    parameters: { path: "Path to the note", name: "Property name" },
    returns: "Property value as text",
    tips: ["Returns empty if property doesn't exist"],
  },
  remove_property: {
    description: "Removes a frontmatter property from a note.",
    parameters: { path: "Path to the note", name: "Property name" },
    returns: "Confirmation message",
    tips: ["Removes the property entirely from frontmatter"],
  },
  search_notes: {
    description: "Full-text search across notes using Obsidian's indexed search. Supports property syntax.",
    parameters: { query: "Search query (supports property::value syntax)", path: "(optional) Subfolder filter", limit: "(optional) Max results", case_sensitive: "(optional) Case sensitive" },
    returns: "Array of matching results or compacted result",
    tips: ["Use property syntax like 'status::open' to search frontmatter", "Results are from Obsidian's index, very fast"],
  },
  search_context: {
    description: "Search with matching line context. Returns grep-style path:line:text output.",
    parameters: { query: "Search query", path: "(optional) Subfolder", limit: "(optional) Max files", case_sensitive: "(optional) Case sensitive" },
    returns: "Matching lines with context",
    tips: ["Use when you need to see the matching lines, not just file paths"],
  },
  search_by_tag: {
    description: "Finds all notes that contain a specific tag.",
    parameters: { tag: "Tag to search for (with or without # prefix)" },
    returns: "Tag info with file list",
    tips: ["Works with nested tags"],
  },
  find_notes_by_name: {
    description: "Finds notes whose filename contains the given substring.",
    parameters: { pattern: "Substring to match against note names" },
    returns: "Array of matching results or compacted result",
    tips: ["Case-insensitive matching"],
  },
  get_backlinks: {
    description: "Finds all notes that contain a wiki-link pointing to the given note.",
    parameters: { path: "(optional) Path to the note", file: "(optional) File name (wikilink resolution)" },
    returns: "Backlinks with counts in JSON",
    tips: ["Uses Obsidian's native backlink index"],
  },
  get_outgoing_links: {
    description: "Gets all outgoing links from a specific note.",
    parameters: { path: "(optional) Path to the note", file: "(optional) File name" },
    returns: "List of outgoing links",
    tips: ["Returns link targets"],
  },
  get_graph: {
    description: "Returns orphan notes (no incoming links), deadend notes (no outgoing links), and unresolved links.",
    parameters: {},
    returns: "Object with orphans, deadends, unresolved arrays",
    tips: ["Uses Obsidian's native graph data"],
  },
  list_tasks: {
    description: "Lists task checkboxes across the vault with native Obsidian task parsing.",
    parameters: { path: "(optional) File path filter", file: "(optional) File name filter", status: "(optional) 'all', 'open', or 'done'" },
    returns: "Array of tasks or compacted result",
    tips: ["Use status filter to narrow results", "verbose mode includes file paths and line numbers"],
  },
  toggle_task: {
    description: "Toggles a task checkbox between done and open.",
    parameters: { path: "Path to the note", line: "Line number of the task (1-based)" },
    returns: "Confirmation message",
    tips: ["Use list_tasks to find task line numbers first"],
  },
  list_attachments: {
    description: "Lists all non-markdown files in the vault.",
    parameters: { folder: "(optional) Filter by folder" },
    returns: "Array of {name, path} or compacted result",
    tips: ["Filter by folder to narrow results"],
  },
  insert_image: {
    description: "Saves a base64-encoded image as an attachment and inserts an embed into a note.",
    parameters: { path: "Note to insert into", imageData: "Base64 image data", fileName: "Name for the image file", caption: "(optional) Alt text", folder: "(optional) Target folder (default: attachments)" },
    returns: "Confirmation with saved path",
    tips: ["Supports PNG, JPEG, WebP, GIF", "Max 10MB"],
  },
};

export function registerMetaTools(server: McpServer): void {
  server.registerTool(
    "discover_tools",
    {
      description: "List all available tools with short descriptions",
      inputSchema: z.object({}),
    },
    async () => ({
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(TOOL_CATALOG, null, 2),
        },
      ],
    }),
  );

  server.registerTool(
    "get_tool_info",
    {
      description:
        "Get detailed documentation for a specific tool",
      inputSchema: z.object({
        tool_name: z
          .string()
          .describe("Name of the tool to get info about"),
      }),
    },
    async ({ tool_name }) => {
      const info = TOOL_DETAILS[tool_name];
      if (!info) {
        const available = Object.keys(TOOL_CATALOG).join(", ");
        return {
          content: [
            {
              type: "text" as const,
              text: `Unknown tool: "${tool_name}". Available: ${available}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ name: tool_name, ...info }, null, 2),
          },
        ],
      };
    },
  );
}
