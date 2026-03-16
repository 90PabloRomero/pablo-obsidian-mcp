---
description: Show detailed metadata and context for a note
argument-hint: [path]
---

Display detailed metadata and context for a specific note in the vault.

If a path is provided as $1, use it. Otherwise, ask the user which note they want to inspect.

## Path resolution

If the given path does not match an existing note exactly, use `find_notes_by_name` to search by filename substring. If multiple results come back, present them and ask the user to pick one.

## Gathering metadata

Use `show_note` with the resolved path. This returns all metadata in a single call:
- Properties (frontmatter): type, status, priority, assignee, tags, created, updated
- Outline (heading hierarchy)
- Backlinks (notes that link to this note)
- Outgoing links (notes this note links to)
- Tasks (open and completed checkboxes)

## Presentation

Organize the output clearly:

1. **Header**: note name and path
2. **Properties**: show as a table (property | value). Omit empty properties.
3. **Tags**: list all tags
4. **Outline**: show heading hierarchy with indentation
5. **Backlinks**: list notes that reference this one
6. **Outgoing links**: list notes this one references
7. **Tasks**: show count (X open, Y done). List open tasks if 10 or fewer.

## Alerts

- If there are unresolved outgoing links (point to notes that don't exist), flag them
- If the note has no backlinks (orphan), mention it

## Follow-ups

- Offer to show full content with `read_note` if the user wants to read the note body
- If the note has backlinks, suggest inspecting one with `/obsidian:show`
- If properties are missing or incomplete, suggest updating with `/obsidian:update`
