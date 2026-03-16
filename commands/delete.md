---
description: Delete a note (moves to trash by default)
argument-hint: [path]
---

Delete a note from the vault. By default, moves to Obsidian's trash (recoverable).

If a path is provided as $1, use it. Otherwise, ask the user which note to delete.

## Path resolution

If the given path does not match an existing note exactly, use `find_notes_by_name` to search by filename substring. If multiple results come back, present them and ask the user to pick one.

## Before deleting

1. Use `show_note` to display the note's current state
2. Check backlinks. If the note has backlinks, warn the user:
   - List the notes that link to this one
   - Explain these will become unresolved links after deletion
3. Ask the user to confirm before proceeding

## Delete

Call `delete_note` with the path. This moves the note to Obsidian's trash by default.

Only use `permanent=true` if the user explicitly requests permanent deletion. Warn them this cannot be undone.

## After deleting

- Confirm the note was deleted
- If it had backlinks, suggest running `/obsidian:show` on affected notes to check for broken links
- Suggest checking vault health with `get_graph` to see unresolved links
