import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { obsidian } from "../cli.ts";

export function registerGraphTools(server: McpServer): void {
  server.registerTool(
    "get_backlinks",
    {
      description:
        "Find all notes that link to a given note via [[wiki-links]]",
      inputSchema: z.object({
        path: z
          .string()
          .optional()
          .describe("Path to the note (defaults to active file)"),
        file: z
          .string()
          .optional()
          .describe("File name to find backlinks for (resolved like wikilinks)"),
      }),
    },
    async ({ path, file }) => {
      const raw = await obsidian("backlinks", {
        path,
        file,
        counts: true,
        format: "json",
      } as Record<string, string | boolean | undefined>);

      return {
        content: [
          {
            type: "text" as const,
            text: raw || "No backlinks found",
          },
        ],
      };
    },
  );

  server.registerTool(
    "get_outgoing_links",
    {
      description: "Get all outgoing links from a specific note",
      inputSchema: z.object({
        path: z
          .string()
          .optional()
          .describe("Path to the note"),
        file: z
          .string()
          .optional()
          .describe("File name (resolved like wikilinks)"),
      }),
    },
    async ({ path, file }) => {
      const raw = await obsidian("links", { path, file });
      return {
        content: [
          {
            type: "text" as const,
            text: raw || "No outgoing links found",
          },
        ],
      };
    },
  );

  server.registerTool(
    "get_graph",
    {
      description:
        "Get graph analysis: orphans (no incoming links) and deadends (no outgoing links)",
      inputSchema: z.object({}),
    },
    async () => {
      const [orphans, deadends, unresolved] = await Promise.all([
        obsidian("orphans"),
        obsidian("deadends"),
        obsidian("unresolved", { verbose: true, format: "json" } as Record<string, string | boolean>).catch(() => "[]"),
      ]);

      const graph = {
        orphans: orphans.split("\n").filter(Boolean),
        deadends: deadends.split("\n").filter(Boolean),
        unresolved: safeJsonParse(unresolved, []),
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(graph, null, 2),
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
