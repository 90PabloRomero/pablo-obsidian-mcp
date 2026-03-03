import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const TOOL_CATALOG: Record<string, string> = {
  discover_tools: "List all available tools with short descriptions",
  get_tool_info: "Get detailed docs for a specific tool",
  list_notes: "List note names and paths (compacted for large vaults)",
  read_note: "Read the full markdown content of a note",
  show_note: "Get note metadata (size, tags, links, tasks) without content",
  get_vault_stats: "Vault-wide statistics: note count, tags, links, tasks",
  create_note: "Create a new markdown note",
  edit_note: "Replace the entire content of an existing note",
  delete_note: "Delete a note from the vault",
  delete_folder: "Delete a folder and all its contents",
  append_to_note: "Append content to the end of a note",
  search_notes: "Full-text search across notes with matching lines",
  search_by_tag: "Find all notes containing a specific hashtag",
  find_notes_by_name: "Find notes by filename substring match",
  get_backlinks: "Find notes that link to a given note",
  get_outgoing_links: "Get all wiki-links from a specific note",
  get_graph: "Get the complete link graph of the vault",
  list_tasks: "List all task checkboxes across the vault",
  toggle_task: "Toggle a task checkbox between done and open",
  list_attachments: "List non-markdown files with reference status",
  organize_attachments: "Move attachments to a folder and update references",
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
    description: "Returns a catalog of all 22 tools with one-line descriptions. Call this first to understand what's available.",
    parameters: {},
    returns: "Object mapping tool names to descriptions",
    tips: ["Call once at the start of a session", "Use get_tool_info for details on specific tools"],
  },
  get_tool_info: {
    description: "Returns detailed documentation for a single tool including parameters, return format, and usage tips.",
    parameters: { tool_name: "Name of the tool to get info about" },
    returns: "Detailed tool documentation object",
    tips: ["Use discover_tools first to see available tools"],
  },
  list_notes: {
    description: "Lists all markdown notes in the vault or a subfolder. Returns only names and paths for efficiency. Large results are automatically compacted.",
    parameters: { path: "(optional) Subfolder to filter" },
    returns: "Array of {name, path} or compacted result with preview",
    tips: ["Use path filter to narrow results in large vaults", "Use read_note to get content, show_note for metadata"],
  },
  read_note: {
    description: "Reads the full markdown content of a single note.",
    parameters: { path: "Path to the note relative to vault root" },
    returns: "Full markdown content as text",
    tips: ["Use show_note first if you only need metadata", "Path should include .md extension"],
  },
  show_note: {
    description: "Returns rich metadata about a note WITHOUT reading the full content. Includes size, modified date, word count, tags, links, task summary, and frontmatter.",
    parameters: { path: "Path to the note relative to vault root" },
    returns: "Object with name, path, size, modified, wordCount, tags, links, tasks, frontmatter",
    tips: ["Cheaper than read_note for exploration", "Use read_note when you need the actual content"],
  },
  get_vault_stats: {
    description: "Returns vault-wide statistics including note count, all tags, link count, and task stats.",
    parameters: {},
    returns: "Object with noteCount, tagCount, tags array, linkCount, taskStats",
    tips: ["Reads all notes - can be slow on very large vaults"],
  },
  create_note: {
    description: "Creates a new markdown note at the specified path.",
    parameters: { path: "Path for the new note", content: "Markdown content", overwrite: "(optional) Overwrite if exists" },
    returns: "Confirmation message",
    tips: ["Directories are created automatically", "Set overwrite=true to replace existing notes"],
  },
  edit_note: {
    description: "Replaces the entire content of an existing note.",
    parameters: { path: "Path to the note", content: "New markdown content" },
    returns: "Confirmation message",
    tips: ["Note must exist - use create_note for new notes", "Read the note first to avoid losing content"],
  },
  delete_note: {
    description: "Permanently deletes a note from the vault.",
    parameters: { path: "Path to the note" },
    returns: "Confirmation message",
    tips: ["This is irreversible"],
  },
  delete_folder: {
    description: "Deletes a folder and all notes inside it.",
    parameters: { path: "Path to the folder" },
    returns: "Confirmation with count of deleted notes",
    tips: ["This is irreversible", "Includes all nested subfolders"],
  },
  append_to_note: {
    description: "Appends content to the end of an existing note, separated by a newline.",
    parameters: { path: "Path to the note", content: "Content to append" },
    returns: "Confirmation message",
    tips: ["Automatically adds newline separator"],
  },
  search_notes: {
    description: "Full-text search across all notes. Returns matching lines with line numbers. Results compacted for large result sets.",
    parameters: { query: "Text to search for (case-insensitive)", path: "(optional) Subfolder to limit search" },
    returns: "Array of {note, path, matches[{line, text}]} or compacted result",
    tips: ["Use path filter to narrow search scope", "Case-insensitive matching"],
  },
  search_by_tag: {
    description: "Finds all notes that contain a specific hashtag.",
    parameters: { tag: "Tag to search for (without # prefix)" },
    returns: "Array of {note, path} or compacted result",
    tips: ["Don't include the # prefix", "Tags are extracted from note content, not frontmatter"],
  },
  find_notes_by_name: {
    description: "Finds notes whose filename contains the given substring (case-insensitive).",
    parameters: { pattern: "Substring to match against note names" },
    returns: "Array of {name, path} or compacted result",
    tips: ["Matches against the note name, not the full path"],
  },
  get_backlinks: {
    description: "Finds all notes that contain a [[wiki-link]] pointing to the given note.",
    parameters: { noteName: "Name of the target note (without .md)" },
    returns: "Array of {note, path}",
    tips: ["Case-insensitive link matching"],
  },
  get_outgoing_links: {
    description: "Extracts all [[wiki-links]] from a specific note.",
    parameters: { path: "Path to the note" },
    returns: "Array of link target names",
    tips: ["Returns link targets, not full paths"],
  },
  get_graph: {
    description: "Builds the complete link graph of the vault including orphan detection and unresolved links.",
    parameters: {},
    returns: "Object with nodes count, edges count, orphans, unresolvedLinks, connections",
    tips: ["Reads all notes - can be slow on large vaults"],
  },
  list_tasks: {
    description: "Lists all task checkboxes (- [ ] / - [x]) across the vault. Results compacted for large sets.",
    parameters: { path: "(optional) Subfolder filter", status: "(optional) 'all', 'open', or 'done'" },
    returns: "Array of {note, path, line, text, done} or compacted result",
    tips: ["Filter by status to reduce results", "Use toggle_task with the line number to change status"],
  },
  toggle_task: {
    description: "Toggles a task checkbox between done (- [x]) and open (- [ ]).",
    parameters: { path: "Path to the note", lineNumber: "1-based line number of the task" },
    returns: "Confirmation with new status",
    tips: ["Use list_tasks to find task line numbers first"],
  },
  list_attachments: {
    description: "Lists all non-markdown files in the vault with their reference status (whether any note links to them).",
    parameters: { orphansOnly: "(optional) If true, only unreferenced attachments" },
    returns: "Array of {name, path, size, referenced} or compacted result",
    tips: ["Use orphansOnly=true to find unused files", "Use organize_attachments to clean up"],
  },
  organize_attachments: {
    description: "Moves all attachments into a designated folder and updates ![[]] references in all notes.",
    parameters: { folder: "(optional) Target folder (default: 'attachments')", deleteOrphans: "(optional) Delete unreferenced files instead of moving" },
    returns: "Summary of moved, deleted, and skipped files",
    tips: ["References are automatically updated", "Use deleteOrphans=true to clean up unused files"],
  },
  insert_image: {
    description: "Saves a base64-encoded image as an attachment and inserts an ![[image]] embed into a note.",
    parameters: { path: "Note to insert into", imageData: "Base64 image data (with or without data URI prefix)", fileName: "Name for the image file", caption: "(optional) Alt text for the embed", line: "(optional) Line number to insert at", folder: "(optional) Folder for the image (default: 'attachments')" },
    returns: "Confirmation with saved path",
    tips: ["Supports PNG, JPEG, WebP, GIF", "Max 10MB", "Data URI prefix is automatically stripped"],
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
