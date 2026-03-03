import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { VaultManager } from "../vault.ts";

export function registerWriteTools(
  server: McpServer,
  vault: VaultManager,
): void {
  server.registerTool(
    "create_note",
    {
      description: "Create a new markdown note in the vault",
      inputSchema: z.object({
        path: z
          .string()
          .describe("Path for the new note (e.g. 'folder/note.md')"),
        content: z.string().describe("Markdown content for the note"),
        overwrite: z
          .boolean()
          .optional()
          .describe("Overwrite if the note already exists (default: false)"),
      }),
    },
    async ({ path, content, overwrite }) => {
      const exists = await vault.exists(path);
      if (exists && !overwrite) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Note already exists at ${path}. Set overwrite=true to replace it.`,
            },
          ],
          isError: true,
        };
      }

      await vault.writeFile(path, content);
      return {
        content: [
          {
            type: "text" as const,
            text: `Note created at ${path}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "edit_note",
    {
      description: "Replace the entire content of an existing note",
      inputSchema: z.object({
        path: z.string().describe("Path to the note to edit"),
        content: z.string().describe("New markdown content"),
      }),
    },
    async ({ path, content }) => {
      const exists = await vault.exists(path);
      if (!exists) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Note not found: ${path}`,
            },
          ],
          isError: true,
        };
      }

      await vault.writeFile(path, content);
      return {
        content: [
          {
            type: "text" as const,
            text: `Note updated: ${path}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "delete_note",
    {
      description: "Delete a note from the vault",
      inputSchema: z.object({
        path: z.string().describe("Path to the note to delete"),
      }),
    },
    async ({ path }) => {
      const exists = await vault.exists(path);
      if (!exists) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Note not found: ${path}`,
            },
          ],
          isError: true,
        };
      }

      await vault.deleteFile(path);
      return {
        content: [
          {
            type: "text" as const,
            text: `Note deleted: ${path}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "delete_folder",
    {
      description:
        "Delete a folder and all its contents from the vault",
      inputSchema: z.object({
        path: z
          .string()
          .describe("Path to the folder to delete (relative to vault root)"),
      }),
    },
    async ({ path }) => {
      const exists = await vault.exists(path);
      if (!exists) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Folder not found: ${path}`,
            },
          ],
          isError: true,
        };
      }

      const { deleted } = await vault.deleteDir(path);
      return {
        content: [
          {
            type: "text" as const,
            text: `Folder deleted: ${path} (${deleted} note${deleted !== 1 ? "s" : ""} removed)`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "append_to_note",
    {
      description: "Append content to the end of an existing note",
      inputSchema: z.object({
        path: z.string().describe("Path to the note"),
        content: z
          .string()
          .describe("Content to append (will be added after a newline)"),
      }),
    },
    async ({ path, content }) => {
      const exists = await vault.exists(path);
      if (!exists) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Note not found: ${path}`,
            },
          ],
          isError: true,
        };
      }

      const existing = await vault.readFile(path);
      const separator = existing.endsWith("\n") ? "" : "\n";
      await vault.writeFile(path, existing + separator + content);

      return {
        content: [
          {
            type: "text" as const,
            text: `Content appended to ${path}`,
          },
        ],
      };
    },
  );
}
