import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { VaultManager } from "../vault.ts";
import { extractTags } from "../parser.ts";
import { compactResults } from "../compact.ts";

interface SearchMatch {
  note: string;
  path: string;
  matches: { line: number; text: string }[];
}

export function registerSearchTools(
  server: McpServer,
  vault: VaultManager,
): void {
  server.registerTool(
    "search_notes",
    {
      description:
        "Search for text across all notes in the vault. Returns matching lines with context.",
      inputSchema: z.object({
        query: z.string().describe("Text to search for (case-insensitive)"),
        path: z
          .string()
          .optional()
          .describe("Subfolder to limit the search"),
      }),
    },
    async ({ query, path }) => {
      const notes = await vault.listFiles(path);
      const results: SearchMatch[] = [];
      const queryLower = query.toLowerCase();

      for (const note of notes) {
        const content = await vault.readFile(note.path);
        const lines = content.split("\n");
        const matches: { line: number; text: string }[] = [];

        for (let i = 0; i < lines.length; i++) {
          if (lines[i]!.toLowerCase().includes(queryLower)) {
            matches.push({ line: i + 1, text: lines[i]! });
          }
        }

        if (matches.length > 0) {
          results.push({
            note: note.name,
            path: note.path,
            matches,
          });
        }
      }

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
      description: "Find all notes containing a specific hashtag",
      inputSchema: z.object({
        tag: z
          .string()
          .describe("Tag to search for (without the # prefix)"),
      }),
    },
    async ({ tag }) => {
      const notes = await vault.listFiles();
      const tagClean = tag.startsWith("#") ? tag.slice(1) : tag;
      const results: { note: string; path: string }[] = [];

      for (const note of notes) {
        const content = await vault.readFile(note.path);
        const tags = extractTags(content);
        if (tags.includes(tagClean)) {
          results.push({ note: note.name, path: note.path });
        }
      }

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No notes found with tag #${tagClean}`,
            },
          ],
        };
      }

      const compacted = compactResults(results, {
        entityName: "tagged notes",
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
      const notes = await vault.listFiles();
      const patternLower = pattern.toLowerCase();
      const results = notes
        .filter((n) => n.name.toLowerCase().includes(patternLower))
        .map((n) => ({ name: n.name, path: n.path }));

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
