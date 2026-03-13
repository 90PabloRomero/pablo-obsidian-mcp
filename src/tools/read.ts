import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { obsidian, obsidianJson } from "../cli.ts";
import { compactResults } from "../compact.ts";

export function registerReadTools(server: McpServer): void {
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
      const raw = await obsidian("files", {
        folder: path,
        ext: "md",
      });

      const notes = raw
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const name = line.replace(/\.md$/, "").split("/").pop()!;
          return { name, path: line };
        });

      const result = compactResults(notes, {
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
      const content = await obsidian("read", { path });
      return {
        content: [{ type: "text" as const, text: content }],
      };
    },
  );

  server.registerTool(
    "show_note",
    {
      description:
        "Get note metadata (size, tags, links, tasks, properties) without reading full content",
      inputSchema: z.object({
        path: z
          .string()
          .describe("Path to the note relative to vault root"),
      }),
    },
    async ({ path }) => {
      const [fileInfo, tags, properties, outline, backlinksRaw, linksRaw, tasksTodo, tasksDone] =
        await Promise.all([
          obsidian("file", { path }),
          obsidian("tags", { path, format: "json" } as Record<string, string>).catch(() => "[]"),
          obsidian("properties", { path, format: "json" } as Record<string, string>).catch(() => "{}"),
          obsidian("outline", { path, format: "json" } as Record<string, string>).catch(() => "[]"),
          obsidian("backlinks", { path, total: true }).catch(() => "0"),
          obsidian("links", { path, total: true }).catch(() => "0"),
          obsidian("tasks", { path, todo: true, total: true }).catch(() => "0"),
          obsidian("tasks", { path, done: true, total: true }).catch(() => "0"),
        ]);

      const metadata = {
        fileInfo,
        tags: safeJsonParse(tags, []),
        properties: safeJsonParse(properties, {}),
        outline: safeJsonParse(outline, []),
        backlinks: parseInt(backlinksRaw) || 0,
        outgoingLinks: parseInt(linksRaw) || 0,
        tasks: {
          open: parseInt(tasksTodo) || 0,
          done: parseInt(tasksDone) || 0,
          total: (parseInt(tasksTodo) || 0) + (parseInt(tasksDone) || 0),
        },
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
      const [vaultInfo, fileCount, tagData, tasksTodo, tasksDone, unresolvedCount, orphanCount] =
        await Promise.all([
          obsidian("vault"),
          obsidian("files", { total: true }),
          obsidian("tags", { counts: true }, { format: "json" }).catch(() => "[]"),
          obsidian("tasks", { todo: true, total: true }).catch(() => "0"),
          obsidian("tasks", { done: true, total: true }).catch(() => "0"),
          obsidian("unresolved", { total: true }).catch(() => "0"),
          obsidian("orphans", { total: true }).catch(() => "0"),
        ]);

      const tags = safeJsonParse<{ tag: string; count: string }[]>(tagData, []);

      const stats = {
        vault: vaultInfo,
        noteCount: parseInt(fileCount) || 0,
        tagCount: tags.length,
        tags: tags.map((t) => ({ tag: t.tag, count: parseInt(t.count) || 0 })),
        taskStats: {
          open: parseInt(tasksTodo) || 0,
          done: parseInt(tasksDone) || 0,
          total: (parseInt(tasksTodo) || 0) + (parseInt(tasksDone) || 0),
        },
        unresolvedLinks: parseInt(unresolvedCount) || 0,
        orphanNotes: parseInt(orphanCount) || 0,
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

function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}
