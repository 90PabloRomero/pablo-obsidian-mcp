import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { VaultManager } from "../vault.ts";
import {
  extractTags,
  extractWikiLinks,
  extractTasks,
  extractFrontmatter,
} from "../parser.ts";
import { compactResults } from "../compact.ts";

export function registerReadTools(
  server: McpServer,
  vault: VaultManager,
): void {
  server.registerTool(
    "list_notes",
    {
      description: "List all markdown notes in the vault or a subfolder",
      inputSchema: z.object({
        path: z
          .string()
          .optional()
          .describe("Subfolder to filter (relative to vault root)"),
      }),
    },
    async ({ path }) => {
      const notes = await vault.listFiles(path);
      const slim = notes.map((n) => ({ name: n.name, path: n.path }));
      const result = compactResults(slim, {
        entityName: "notes",
        detailTool: "read_note",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "read_note",
    {
      description: "Read the full markdown content of a note",
      inputSchema: z.object({
        path: z
          .string()
          .describe(
            "Path to the note relative to vault root (e.g. 'folder/note.md')",
          ),
      }),
    },
    async ({ path }) => {
      const content = await vault.readFile(path);
      return {
        content: [{ type: "text" as const, text: content }],
      };
    },
  );

  server.registerTool(
    "show_note",
    {
      description:
        "Get note metadata (size, tags, links, tasks) without reading full content",
      inputSchema: z.object({
        path: z
          .string()
          .describe("Path to the note relative to vault root"),
      }),
    },
    async ({ path }) => {
      const [info, content] = await Promise.all([
        vault.getFileInfo(path),
        vault.readFile(path),
      ]);

      const tags = extractTags(content);
      const links = extractWikiLinks(content);
      const tasks = extractTasks(content);
      const frontmatter = extractFrontmatter(content);
      const wordCount = content
        .split(/\s+/)
        .filter((w) => w.length > 0).length;

      const metadata = {
        name: info.name,
        path: info.path,
        size: info.size,
        modified: info.modified,
        wordCount,
        tags,
        links,
        tasks: {
          total: tasks.length,
          open: tasks.filter((t) => !t.done).length,
          done: tasks.filter((t) => t.done).length,
        },
        frontmatter,
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(metadata, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "get_vault_stats",
    {
      description:
        "Get statistics about the vault: note count, tags, links, tasks",
      inputSchema: z.object({}),
    },
    async () => {
      const notes = await vault.listFiles();
      const allTags = new Set<string>();
      let linkCount = 0;
      let totalTasks = 0;
      let doneTasks = 0;

      for (const note of notes) {
        const content = await vault.readFile(note.path);
        for (const tag of extractTags(content)) {
          allTags.add(tag);
        }
        linkCount += extractWikiLinks(content).length;
        const tasks = extractTasks(content);
        totalTasks += tasks.length;
        doneTasks += tasks.filter((t) => t.done).length;
      }

      const stats = {
        noteCount: notes.length,
        tagCount: allTags.size,
        tags: [...allTags].sort(),
        linkCount,
        taskStats: {
          total: totalTasks,
          done: doneTasks,
          open: totalTasks - doneTasks,
        },
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(stats, null, 2),
          },
        ],
      };
    },
  );
}
