import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { VaultManager } from "../vault.ts";
import { extractTasks } from "../parser.ts";
import { compactResults } from "../compact.ts";

interface TaskResult {
  note: string;
  path: string;
  line: number;
  text: string;
  done: boolean;
}

export function registerTaskTools(
  server: McpServer,
  vault: VaultManager,
): void {
  server.registerTool(
    "list_tasks",
    {
      description:
        "List all tasks (checkboxes) across the vault, optionally filtered by status",
      inputSchema: z.object({
        path: z
          .string()
          .optional()
          .describe("Subfolder to limit the search"),
        status: z
          .enum(["all", "open", "done"])
          .optional()
          .describe("Filter by task status (default: all)"),
      }),
    },
    async ({ path, status }) => {
      const notes = await vault.listFiles(path);
      const results: TaskResult[] = [];
      const filter = status ?? "all";

      for (const note of notes) {
        const content = await vault.readFile(note.path);
        const tasks = extractTasks(content);

        for (const task of tasks) {
          if (filter === "open" && task.done) continue;
          if (filter === "done" && !task.done) continue;

          results.push({
            note: note.name,
            path: note.path,
            line: task.line,
            text: task.text,
            done: task.done,
          });
        }
      }

      if (results.length === 0) {
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
        lineNumber: z
          .number()
          .describe("Line number of the task to toggle (1-based)"),
      }),
    },
    async ({ path, lineNumber }) => {
      const line = await vault.readLine(path, lineNumber);

      const match = line.match(/^([\s]*- \[)([ xX])(\]\s+.+)/);
      if (!match) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Line ${lineNumber} is not a task checkbox`,
            },
          ],
          isError: true,
        };
      }

      const wasDone = match[2] !== " ";
      const newCheckmark = wasDone ? " " : "x";
      const newLine = `${match[1]}${newCheckmark}${match[3]}`;

      await vault.replaceLine(path, lineNumber, newLine);

      return {
        content: [
          {
            type: "text" as const,
            text: `Task on line ${lineNumber} toggled to ${wasDone ? "open" : "done"}`,
          },
        ],
      };
    },
  );
}
