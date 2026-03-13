---
description: Restore an archived note back to open status
argument-hint: [path] [reason]
---

Restore a previously archived note back to active status.

If arguments are provided:
- $1: Note path
- $2+: Reason for restoring (optional)

If the path is missing, ask the user which note to unarchive.

## Path resolution

If the given path does not match an existing note exactly, use `find_notes_by_name` to search by filename substring. If multiple results come back, present them and ask the user to pick one.

## Before unarchiving

Use `show_note` to display the current state. Verify the note has `status: archived` by checking its properties. If it does not, inform the user the note is not archived and stop.

## Unarchive steps

1. Call `set_property` with `name=status`, `value=open`, `type=text`
2. Call `set_property` with `name=updated`, `value=<current ISO 8601>`, `type=datetime`
3. If a reason was provided ($2+), call `append_to_note` to add it as a record:
   ```
   ## Unarchived
   <reason> (<date>)
   ```
4. If the note is inside an `archive/` folder, ask the user where to move it back to. Use `move_note` to relocate it (wiki-links update automatically)

## After unarchiving

Show the updated note with `show_note` to confirm, then suggest:
- Review the note details: `/obsidian:show`
- Update properties if needed: `/obsidian:update`
