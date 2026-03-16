---
description: Show version info for Obsidian CLI and MCP server
---

Display version information for all components.

## Steps

1. Run `obsidian version` via CLI to get Obsidian CLI version
2. Read the MCP server version from the server info (version 2.0.0)
3. Read the plugin version from plugin.json (version 2.0.0)

## Output

```
Obsidian CLI: <version>
MCP Server:   <version>
Plugin:       <version>
Vault:        <vault name> (<vault path>)
```

## Follow-ups

- Check vault health: `/obsidian:init`
- View full stats: `/obsidian:stats`
