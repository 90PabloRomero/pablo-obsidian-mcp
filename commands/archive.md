---
description: Archive a note by setting status to archived
argument-hint: [path] [reason]
---

Archive a note that is completed or no longer active.

If arguments are provided:
- $1: Note path
- $2+: Completion reason (optional)

If the path is missing, ask the user which note to archive.

## Path resolution

If the given path does not match an existing note exactly, use `find_notes_by_name` to search by filename substring. If multiple results come back, present them and ask the user to pick one.

## Before archiving

Use `show_note` to display the current state of the note. Confirm with the user before proceeding.

## Archive steps

1. Call `set_property` with `name=status`, `value=archived`, `type=text` on the note
2. Call `set_property` with `name=updated`, `value=<current ISO 8601>`, `type=datetime`
3. If a reason was provided ($2+), call `append_to_note` to add it as an archive record:
   ```
   ## Archived
   <reason> (<date>)
   ```
4. Ask the user if they want to move the note to an `archive/` folder. If yes, use `move_note` to relocate it (wiki-links update automatically)

## After archiving

Show the updated note with `show_note` to confirm, then suggest:
- Check for notes that may now be unblocked: `/obsidian:tasks-ready`
- Create a follow-up note if new work was discovered: `/obsidian:create`
- Undo this action if needed: `/obsidian:unarchive`
