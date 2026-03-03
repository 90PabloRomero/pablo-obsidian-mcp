import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { VaultManager } from "../vault.ts";
import { extractWikiLinks } from "../parser.ts";

interface GraphNode {
  name: string;
  path: string;
}

interface GraphEdge {
  from: string;
  to: string;
}

export function registerGraphTools(
  server: McpServer,
  vault: VaultManager,
): void {
  server.registerTool(
    "get_backlinks",
    {
      description:
        "Find all notes that link to a given note via [[wiki-links]]",
      inputSchema: z.object({
        noteName: z
          .string()
          .describe("Name of the note to find backlinks for (without .md)"),
      }),
    },
    async ({ noteName }) => {
      const notes = await vault.listFiles();
      const backlinks: { note: string; path: string }[] = [];

      for (const note of notes) {
        const content = await vault.readFile(note.path);
        const links = extractWikiLinks(content);
        if (links.some((l) => l.toLowerCase() === noteName.toLowerCase())) {
          backlinks.push({ note: note.name, path: note.path });
        }
      }

      if (backlinks.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No backlinks found for "${noteName}"`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(backlinks, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "get_outgoing_links",
    {
      description: "Get all wiki-links found in a specific note",
      inputSchema: z.object({
        path: z.string().describe("Path to the note"),
      }),
    },
    async ({ path }) => {
      const content = await vault.readFile(path);
      const links = extractWikiLinks(content);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(links, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "get_graph",
    {
      description:
        "Get the complete link graph of the vault (all nodes and edges)",
      inputSchema: z.object({}),
    },
    async () => {
      const notes = await vault.listFiles();
      const nodes: GraphNode[] = [];
      const edges: GraphEdge[] = [];
      const noteNames = new Set(notes.map((n) => n.name.toLowerCase()));

      for (const note of notes) {
        nodes.push({ name: note.name, path: note.path });
        const content = await vault.readFile(note.path);
        const links = extractWikiLinks(content);

        for (const link of links) {
          edges.push({ from: note.name, to: link });
        }
      }

      const orphans = nodes.filter((n) => {
        const hasOutgoing = edges.some(
          (e) => e.from.toLowerCase() === n.name.toLowerCase(),
        );
        const hasIncoming = edges.some(
          (e) => e.to.toLowerCase() === n.name.toLowerCase(),
        );
        return !hasOutgoing && !hasIncoming;
      });

      const unresolvedLinks = [
        ...new Set(
          edges
            .filter((e) => !noteNames.has(e.to.toLowerCase()))
            .map((e) => e.to),
        ),
      ];

      const graph = {
        nodes: nodes.length,
        edges: edges.length,
        orphans: orphans.map((n) => n.name),
        unresolvedLinks,
        connections: edges,
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
