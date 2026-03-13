---
description: Manage Maps of Content (MOC) - group related notes
argument-hint: [command] [path]
---

Manage Maps of Content (MOCs) - notes that group related notes via wiki-links.

## Subcommands

- $1: Subcommand (status, create, add, remove). Defaults to "status" if omitted.
- $2: MOC path
- $3: Note path (for add/remove)

### status [path]

Show progress for a MOC or all MOCs:
1. If path given, use it. Otherwise, use `search_notes` with query `type::moc` to find all MOCs
2. For each MOC, call `get_outgoing_links` to get grouped notes
3. For each linked note, call `get_property` with `name=status`
4. Calculate completion: (done + archived) / total
5. Present as table:

| MOC | Total | Open | In Progress | Done | Progress |
|-----|-------|------|-------------|------|----------|

6. If a MOC is 100% complete, suggest archiving with `/obsidian:archive`

### create [path]

Create a new MOC:
1. Use `create_note` with the given path
2. Call `set_property` with `name=type`, `value=moc`, `type=text`
3. Set standard frontmatter (status, priority, created, updated)
4. Add a heading structure for organizing wiki-links
5. Suggest adding notes with `/obsidian:moc add`

### add [moc-path] [note-path]

Add a note to a MOC:
1. Read the MOC content with `read_note`
2. Append a wiki-link `[[note-path]]` to the appropriate section
3. Use `edit_note` to save the updated content
4. Confirm the addition

### remove [moc-path] [note-path]

Remove a note from a MOC:
1. Read the MOC content with `read_note`
2. Remove the wiki-link for the given note
3. Use `edit_note` to save the updated content
4. Confirm the removal

## Path resolution

If any given path does not match an existing note exactly, use `find_notes_by_name` to search by filename substring.

## Follow-ups

- View MOC details: `/obsidian:show <path>`
- Add a new note to the MOC: `/obsidian:moc add <moc-path> <note-path>`
- Create a new note for the MOC: `/obsidian:create`
- Archive completed MOC: `/obsidian:archive`
