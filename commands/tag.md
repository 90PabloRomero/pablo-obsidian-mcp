---
description: Manage tags on notes
argument-hint: [command] [path] [tag]
---

Manage tags on notes using Obsidian's native frontmatter tags property.

## Subcommands

- $1: Subcommand (add, remove, list, list-all). Defaults to "list" if only a path is given.
- $2: Note path (not needed for list-all)
- $3: Tag name (for add/remove)

### add [path] [tag]

Add a tag to a note:
1. Call `get_property` with `name=tags` to read current tags
2. If the tag already exists, inform the user and stop
3. Append the new tag to the list
4. Call `set_property` with `name=tags`, `value=<updated list>`, `type=list`
5. Call `set_property` to update `updated` timestamp
6. Confirm by showing the updated tags

### remove [path] [tag]

Remove a tag from a note:
1. Call `get_property` with `name=tags` to read current tags
2. If the tag does not exist, inform the user and stop
3. Filter out the tag from the list
4. Call `set_property` with `name=tags`, `value=<updated list>`, `type=list`
5. Call `set_property` to update `updated` timestamp
6. Confirm by showing the updated tags

### list [path]

Show tags for a specific note:
1. Call `get_property` with `name=tags`
2. Present the list of tags

### list-all

Show all tags in the vault with counts:
1. Call `get_vault_stats` to get all tags with their counts
2. Present as a table sorted by count:

| Tag | Notes |
|-----|-------|

## Path resolution

If the given path does not match an existing note exactly, use `find_notes_by_name` to search by filename substring.

## Follow-ups

- Find all notes with a specific tag: `/obsidian:search` or `search_by_tag`
- View note details: `/obsidian:show <path>`
