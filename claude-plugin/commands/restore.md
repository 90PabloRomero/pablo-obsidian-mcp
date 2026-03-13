---
description: Restore full content of a compacted note from git history
argument-hint: [path]
---

Restore the original content of a compacted note from git version history.

If a path is provided as $1, use it. Otherwise, ask the user which note to restore.

## Prerequisites

The vault must be tracked with git. If it is not, inform the user that restore is not available without version history.

## Path resolution

If the given path does not match an existing note exactly, use `find_notes_by_name` to search by filename substring.

## Steps

1. Call `get_property` with `name=compacted` to verify the note was compacted
2. If not compacted, inform the user and stop
3. Run `git log --oneline -- <vault-path>/<note-path>` to find the commit history for this file
4. Identify the commit just before compaction (the last commit before `compacted` was set to true)
5. Run `git show <commit>:<vault-path>/<note-path>` to retrieve the original content
6. Present the original content to the user

## Read-only by default

This command only displays the original content. After showing it, ask the user:

> "Do you want to revert this note to its original content?"

If yes:
1. Write the original content with `edit_note`
2. Set `compacted` to false with `set_property name=compacted value=false type=checkbox`
3. Update `updated` timestamp
4. Confirm the restoration

If no:
- Do nothing, the note remains compacted

## Follow-ups

- View the restored note: `/obsidian:show <path>`
- Re-compact if needed later: `/obsidian:compact`
