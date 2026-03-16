---
description: Rename or move a note (auto-updates wiki-links)
argument-hint: [path] [new-name|new-path]
---

Rename or move a note. Obsidian CLI automatically updates all wiki-links that reference the note.

- $1: Current note path
- $2: New name (for rename) or new path (for move)

If arguments are missing, ask the user.

## Path resolution

If the given path does not match an existing note exactly, use `find_notes_by_name` to search by filename substring.

## Determining operation

- If $2 contains a `/`, treat as a move: use `move_note` with new path
- If $2 does not contain `/`, treat as a rename: use `rename_note` with new name

## Steps

1. Call `show_note` on the current path to show existing metadata and backlinks
2. Warn the user how many backlinks will be updated
3. Perform the rename or move
4. Update `updated` timestamp with `set_property`
5. Confirm the operation and show the note at its new location

## Follow-ups

- View the renamed note: `/obsidian:show <new-path>`
- Check for broken links: `/obsidian:links unresolved`
