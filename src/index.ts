import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerMetaTools } from "./tools/meta.ts";
import { registerReadTools } from "./tools/read.ts";
import { registerWriteTools } from "./tools/write.ts";
import { registerSearchTools } from "./tools/search.ts";
import { registerGraphTools } from "./tools/graph.ts";
import { registerTaskTools } from "./tools/tasks.ts";
import { registerAttachmentTools } from "./tools/attachments.ts";
import { registerResources } from "./resources.ts";

const server = new McpServer(
  {
    name: "obsidian",
    version: "2.0.0",
  },
  {
    instructions: [
      "Obsidian vault MCP server powered by Obsidian CLI.",
      "",
      "Check the resource obsidian://quickstart to learn how to use this server efficiently.",
      "",
      "Efficiency guidelines:",
      "- list_notes returns only names and paths. Use read_note for content, show_note for metadata.",
      "- show_note returns properties, tags, outline, backlinks, tasks without reading full content.",
      "- search_notes supports property syntax (e.g. query='status::open') for frontmatter queries.",
      "- set_property/get_property/remove_property manage frontmatter with native typing.",
      "- move_note and rename_note automatically update internal wiki-links.",
      "- Large result sets are automatically compacted with a preview. Narrow with path/query filters.",
    ].join("\n"),
  },
);

registerMetaTools(server);
registerReadTools(server);
registerWriteTools(server);
registerSearchTools(server);
registerGraphTools(server);
registerTaskTools(server);
registerAttachmentTools(server);
registerResources(server);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Obsidian MCP server v2.0.0 running on stdio (CLI backend)");
