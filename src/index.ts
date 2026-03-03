import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { VaultManager } from "./vault.ts";
import { registerMetaTools } from "./tools/meta.ts";
import { registerReadTools } from "./tools/read.ts";
import { registerWriteTools } from "./tools/write.ts";
import { registerSearchTools } from "./tools/search.ts";
import { registerGraphTools } from "./tools/graph.ts";
import { registerTaskTools } from "./tools/tasks.ts";
import { registerAttachmentTools } from "./tools/attachments.ts";

const vaultPath = process.env.OBSIDIAN_VAULT_PATH;

if (!vaultPath) {
  console.error(
    "OBSIDIAN_VAULT_PATH environment variable is required",
  );
  process.exit(1);
}

const vault = new VaultManager(vaultPath);

const server = new McpServer(
  {
    name: "obsidian",
    version: "1.1.0",
  },
  {
    instructions: [
      "Obsidian vault MCP server with 22 tools for reading, writing, searching, and analyzing markdown notes.",
      "",
      "Efficiency guidelines:",
      "- Call discover_tools() first to see all available tools.",
      "- list_notes returns only names and paths. Use read_note for content, show_note for metadata.",
      "- show_note is cheaper than read_note when you only need tags, links, word count, or frontmatter.",
      "- Large result sets are automatically compacted with a preview. Narrow with path/query filters for full results.",
      "- insert_image accepts base64 data to save images as attachments and embed them in notes.",
    ].join("\n"),
  },
);

registerMetaTools(server);
registerReadTools(server, vault);
registerWriteTools(server, vault);
registerSearchTools(server, vault);
registerGraphTools(server, vault);
registerTaskTools(server, vault);
registerAttachmentTools(server, vault);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Obsidian MCP server running on stdio");
