---
description: Explore and manage wiki-links in the vault
argument-hint: [command] [path]
---

Explore wiki-link relationships between notes in the vault.

## Subcommands

- $1: Subcommand (show, tree, unresolved, orphans, deadends). Defaults to "show" if omitted.
- $2: Note path (required for show and tree)

### show [path]

Show all links for a specific note:
1. Call `get_backlinks` to find notes that link to this one
2. Call `get_outgoing_links` to find notes this one links to
3. Present both lists clearly

### tree [path]

Generate a mermaid diagram of the note's link neighborhood:
1. Call `get_backlinks` and `get_outgoing_links` for the target note
2. For each linked note, call `get_outgoing_links` again (depth 2 max)
3. Build a mermaid flowchart showing the relationships
4. Present the diagram in a fenced mermaid code block

### unresolved

Show all broken links in the vault:
1. Call `get_graph` which returns unresolved links
2. List each broken link and which note contains it
3. Suggest fixing with `/obsidian:create` (to create the missing note) or editing the source note

### orphans

Show notes with no incoming links (nobody references them):
1. Call `get_graph` which returns orphan notes
2. List them and suggest connecting them with wiki-links or archiving if unused

### deadends

Show notes with no outgoing links (they don't reference anything):
1. Call `get_graph` which returns deadend notes
2. List them and suggest adding wiki-links to connect them to related notes

## Path resolution

If the given path does not match an existing note exactly, use `find_notes_by_name` to search by filename substring.

## Follow-ups

- View a linked note: `/obsidian:show <path>`
- Create a missing note to fix unresolved link: `/obsidian:create`
- Check vault health: `/obsidian:stats`
