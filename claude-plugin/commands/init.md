---
description: Initialize and verify connection to the Obsidian vault
---

Verify the Obsidian vault connection and show an overview of the current state.

Use the obsidian MCP `get_vault_stats` tool to retrieve vault statistics.

After retrieving stats:
1. Show the vault path (from the server connection)
2. Show vault statistics: note count, tag count, link count, task stats
3. Explain the basic workflow (or suggest running `/obsidian:workflow`)
4. Suggest creating the first note with `/obsidian:create`

If the vault has already been used (notes exist), inform the user and show the stats summary.
