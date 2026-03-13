---
description: Update frontmatter properties of a note with native typing
argument-hint: [path] [property] [value]
---

Update one or more frontmatter properties of a note using native Obsidian typing.

If arguments are provided:
- $1: Note path
- $2: Property name (e.g. status, priority, assignee)
- $3: New value

If arguments are missing, ask the user for:
1. Note path (or name to search)
2. Which property to update
3. New value

## Path resolution

If the given path does not match an existing note exactly, use `find_notes_by_name` to search by filename substring. If multiple results come back, present them and ask the user to pick one.

## Property types

Use the correct type when calling `set_property`:

| Property | Type | Valid values |
|----------|------|--------------|
| type | text | project, moc, note, decision |
| status | text | open, in_progress, blocked, done, archived |
| priority | number | 0-4 (0=critical, 1=high, 2=medium, 3=low, 4=backlog) |
| assignee | text | free string |
| tags | list | list of tags |
| created | datetime | ISO 8601 |
| updated | datetime | ISO 8601 |

For any property not in this table, ask the user what type it should be.

## After updating

1. Always set `updated` to the current ISO 8601 timestamp via `set_property` with `type=datetime`
2. Call `show_note` to confirm the change and present the updated metadata
3. If the user updated status to `blocked`, suggest adding a comment explaining why via `/obsidian:append`
4. If the user updated status to `done`, suggest archiving with `/obsidian:archive`

## Multiple updates

If the user wants to update several properties at once, call `set_property` for each one sequentially, then update `updated` once at the end, and show the final state with `show_note`.
