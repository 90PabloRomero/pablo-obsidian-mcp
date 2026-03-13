import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { obsidian } from "../cli.ts";
import { compactResults } from "../compact.ts";

export function registerTaskTools(server: McpServer): void {
  server.registerTool(
    "list_tasks",
    {
      description:
        "List all tasks (checkboxes) across the vault, optionally filtered by status",
      inputSchema: z.object({
        path: z
          .string()
          .optional()
          .describe("Filter by file path"),
        file: z
          .string()
          .optional()
          .describe("Filter by file name"),
        status: z
          .enum(["all", "open", "done"])
          .optional()
          .describe("Filter by task status (default: all)"),
      }),
    },
    async ({ path, file, status }) => {
      const params: Record<string, string | boolean | undefined> = {
        path,
        file,
        verbose: true,
        format: "json",
      };

      if (status === "open") params.todo = true;
      if (status === "done") params.done = true;

      const raw = await obsidian("tasks", params);
      const results = safeJsonParse(raw, []);

      if (results.length === 0) {
        const filter = status ?? "all";
        return {
          content: [
            {
              type: "text" as const,
              text:
                filter === "all"
                  ? "No tasks found in the vault"
                  : `No ${filter} tasks found`,
            },
          ],
        };
      }

      const compacted = compactResults(results, {
        entityName: "tasks",
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
    "toggle_task",
    {
      description:
        "Toggle a task checkbox between done and not done",
      inputSchema: z.object({
        path: z.string().describe("Path to the note containing the task"),
        line: z
          .number()
          .describe("Line number of the task to toggle (1-based)"),
      }),
    },
    async ({ path, line }) => {
      await obsidian("task", { path, line, toggle: true });
      return {
        content: [
          {
            type: "text" as const,
            text: `Task on line ${line} toggled`,
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
