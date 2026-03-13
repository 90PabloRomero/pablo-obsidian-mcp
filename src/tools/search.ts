import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { obsidian, obsidianJson } from "../cli.ts";
import { compactResults } from "../compact.ts";

export function registerSearchTools(server: McpServer): void {
  server.registerTool(
    "search_notes",
    {
      description:
        "Search for text across all notes in the vault. Returns matching file paths.",
      inputSchema: z.object({
        query: z.string().describe("Text to search for (supports property syntax like status::open)"),
        path: z
          .string()
          .optional()
          .describe("Subfolder to limit the search"),
        limit: z
          .number()
          .optional()
          .describe("Max number of results"),
        case_sensitive: z
          .boolean()
          .optional()
          .describe("Case sensitive search"),
      }),
    },
    async ({ query, path, limit, case_sensitive }) => {
      const raw = await obsidian("search", {
        query,
        path,
        limit,
        case: case_sensitive || undefined,
        format: "json",
      } as Record<string, string | number | boolean | undefined>);

      const results = safeJsonParse(raw, []);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No matches found for "${query}"`,
            },
          ],
        };
      }

      const compacted = compactResults(results, {
        entityName: "matching notes",
        detailTool: "read_note",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(compacted, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "search_context",
    {
      description: "Search with matching line context (grep-style path:line:text output)",
      inputSchema: z.object({
        query: z.string().describe("Text to search for"),
        path: z
          .string()
          .optional()
          .describe("Subfolder to limit the search"),
        limit: z
          .number()
          .optional()
          .describe("Max number of files"),
        case_sensitive: z
          .boolean()
          .optional()
          .describe("Case sensitive search"),
      }),
    },
    async ({ query, path, limit, case_sensitive }) => {
      const raw = await obsidian("search:context", {
        query,
        path,
        limit,
        case: case_sensitive || undefined,
        format: "json",
      } as Record<string, string | number | boolean | undefined>);

      const results = safeJsonParse(raw, []);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No matches found for "${query}"`,
            },
          ],
        };
      }

      const compacted = compactResults(results, {
        entityName: "matching notes",
        detailTool: "read_note",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(compacted, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "search_by_tag",
    {
      description: "Find all notes containing a specific tag",
      inputSchema: z.object({
        tag: z
          .string()
          .describe("Tag to search for (without the # prefix)"),
      }),
    },
    async ({ tag }) => {
      const tagClean = tag.startsWith("#") ? tag : `#${tag}`;
      const raw = await obsidian("tag", {
        name: tagClean,
        verbose: true,
      });

      if (!raw || raw.includes("not found")) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No notes found with tag ${tagClean}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: raw,
          },
        ],
      };
    },
  );

  server.registerTool(
    "find_notes_by_name",
    {
      description:
        "Find notes whose filename matches a pattern (case-insensitive substring match)",
      inputSchema: z.object({
        pattern: z
          .string()
          .describe("Pattern to match against note names"),
      }),
    },
    async ({ pattern }) => {
      const raw = await obsidian("search", {
        query: pattern,
        format: "json",
      } as Record<string, string | number | boolean | undefined>);

      const results = safeJsonParse(raw, []);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No notes found matching "${pattern}"`,
            },
          ],
        };
      }

      const compacted = compactResults(results, {
        entityName: "matching notes",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(compacted, null, 2),
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
