import { z } from "zod/v4";
import { mkdir, rm } from "fs/promises";
import { dirname, join } from "path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { obsidian } from "../cli.ts";

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH ?? join(process.env.HOME ?? "", "trabajos/obsidian");

async function ensureParentDir(relativePath: string): Promise<void> {
  const absoluteDir = dirname(join(VAULT_PATH, relativePath));
  await mkdir(absoluteDir, { recursive: true });
}

export function registerWriteTools(server: McpServer): void {
  server.registerTool(
    "create_note",
    {
      description: "Create a new markdown note in the vault",
      inputSchema: z.object({
        path: z
          .string()
          .describe("Path for the new note (e.g. 'folder/note.md')"),
        content: z.string().optional().describe("Markdown content for the note"),
        template: z.string().optional().describe("Template name to use"),
        overwrite: z
          .boolean()
          .optional()
          .describe("Overwrite if the note already exists (default: false)"),
      }),
    },
    async ({ path, content, template, overwrite }) => {
      const params: Record<string, string | boolean | undefined> = {
        path,
        content,
        template,
        overwrite: overwrite || undefined,
      };

      await obsidian("create", params);
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
      await obsidian("create", { path, content, overwrite: true });
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
      description: "Delete a note from the vault (moves to trash by default)",
      inputSchema: z.object({
        path: z.string().describe("Path to the note to delete"),
        permanent: z
          .boolean()
          .optional()
          .describe("Skip trash and delete permanently"),
      }),
    },
    async ({ path, permanent }) => {
      await obsidian("delete", { path, permanent: permanent || undefined });
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
        permanent: z
          .boolean()
          .optional()
          .describe("Skip trash and delete permanently"),
      }),
    },
    async ({ path, permanent }) => {
      const absolutePath = join(VAULT_PATH, path);
      await rm(absolutePath, { recursive: true, force: permanent ?? false });
      return {
        content: [
          {
            type: "text" as const,
            text: `Folder deleted: ${path}`,
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
          .describe("Content to append"),
      }),
    },
    async ({ path, content: text }) => {
      await obsidian("append", { path, content: text });
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

  server.registerTool(
    "prepend_to_note",
    {
      description: "Prepend content after frontmatter of an existing note",
      inputSchema: z.object({
        path: z.string().describe("Path to the note"),
        content: z
          .string()
          .describe("Content to prepend"),
      }),
    },
    async ({ path, content: text }) => {
      await obsidian("prepend", { path, content: text });
      return {
        content: [
          {
            type: "text" as const,
            text: `Content prepended to ${path}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "move_note",
    {
      description: "Move or rename a note (automatically updates internal links)",
      inputSchema: z.object({
        path: z.string().describe("Current path of the note"),
        to: z.string().describe("Destination path"),
      }),
    },
    async ({ path, to }) => {
      await ensureParentDir(to);
      await obsidian("move", { path, to });
      return {
        content: [
          {
            type: "text" as const,
            text: `Note moved from ${path} to ${to} (links updated)`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "rename_note",
    {
      description: "Rename a note (automatically updates internal links)",
      inputSchema: z.object({
        path: z.string().describe("Path to the note"),
        name: z.string().describe("New name for the note"),
      }),
    },
    async ({ path, name }) => {
      await obsidian("rename", { path, name });
      return {
        content: [
          {
            type: "text" as const,
            text: `Note renamed to ${name} (links updated)`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "set_property",
    {
      description: "Set a frontmatter property on a note with native typing",
      inputSchema: z.object({
        path: z.string().describe("Path to the note"),
        name: z.string().describe("Property name"),
        value: z.string().describe("Property value"),
        type: z
          .enum(["text", "list", "number", "checkbox", "date", "datetime"])
          .optional()
          .describe("Property type (default: text)"),
      }),
    },
    async ({ path, name, value, type }) => {
      await obsidian("property:set", { name, value, type, path });
      return {
        content: [
          {
            type: "text" as const,
            text: `Property "${name}" set to "${value}" on ${path}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "get_property",
    {
      description: "Read a frontmatter property value from a note",
      inputSchema: z.object({
        path: z.string().describe("Path to the note"),
        name: z.string().describe("Property name to read"),
      }),
    },
    async ({ path, name }) => {
      const value = await obsidian("property:read", { name, path });
      return {
        content: [
          {
            type: "text" as const,
            text: value || `Property "${name}" not found on ${path}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "remove_property",
    {
      description: "Remove a frontmatter property from a note",
      inputSchema: z.object({
        path: z.string().describe("Path to the note"),
        name: z.string().describe("Property name to remove"),
      }),
    },
    async ({ path, name }) => {
      await obsidian("property:remove", { name, path });
      return {
        content: [
          {
            type: "text" as const,
            text: `Property "${name}" removed from ${path}`,
          },
        ],
      };
    },
  );
}
