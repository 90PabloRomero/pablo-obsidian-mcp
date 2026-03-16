---
description: Record, list, and manage project decisions with rationale tracking
argument-hint: record|list|show|supersede [path]
---

Record and track project decisions as structured notes with rationale, alternatives, and links to affected work.

## Subcommands

- $1: Subcommand (record, list, show, supersede). Defaults to "record".
- $2: Path (for show/supersede)

### record

Gather the following (ask if not provided):
- **Title**: Short summary of what was decided (required)
- **Rationale**: Why this was chosen (required)
- **Alternatives**: What else was considered (optional but encouraged)
- **Affects**: Paths of notes this decision impacts (optional)
- **Priority**: How important (default 2)

Steps:
1. Create the note with `create_note` using this template:
   ```markdown
   # <title>

   ## Decision
   <one-sentence summary>

   ## Rationale
   <why this was chosen>

   ## Alternatives Considered
   - **<alt 1>**: <why rejected>
   - **<alt 2>**: <why rejected>

   ## Affects
   - [[affected-note-1]]
   - [[affected-note-2]]
   ```
2. Set properties: `type=decision`, `status=open`, `priority=<N>`, `created`, `updated`
3. Show the created decision

### list

Find all decisions:
1. Use `search_notes` with query `type::decision`
2. Present as table with path, status, priority, title

### show [path]

Show a decision's full details:
1. Use `show_note` for metadata
2. Use `read_note` for the decision content
3. Present both

### supersede [old-path]

Replace a decision with a new one:
1. Record the new decision (as above)
2. Add a wiki-link from the new decision to the old one
3. Add a comment on the old decision: `/obsidian:comments <old-path> "Superseded by [[new-path]]: <reason>"`
4. Archive the old decision: `/obsidian:archive <old-path> "Superseded by [[new-path]]"`

## Path resolution

If a given path does not match exactly, use `find_notes_by_name` to search.

## Follow-ups

- View decision: `/obsidian:show <path>`
- Add discussion: `/obsidian:comments <path> <text>`
- Search decisions: `/obsidian:search type::decision <keyword>`
