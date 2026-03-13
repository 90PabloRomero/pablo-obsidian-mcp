---
description: Export notes to JSONL format
argument-hint: [--path] [--status] [--type] [-o output-file]
---

Export vault notes to JSON Lines format (one JSON object per line).

Options:
- `--path`: Filter by folder
- `--status`: Filter by status (open, in_progress, blocked, done, archived)
- `--type`: Filter by type (project, moc, note, decision)
- `-o`: Output file path (if omitted, present inline)

## Gathering notes

1. If filters given, use `search_notes` with appropriate query (`status::<value>`, `type::<value>`, path filter)
2. If no filters, use `list_notes` to get all notes
3. For each note:
   a. Call `show_note` to get properties, tags, backlinks, outgoing links
   b. Call `read_note` to get full content
   c. Build a JSON object per note

## JSONL format

Each line is a JSON object:
```json
{"path": "folder/note.md", "properties": {"type": "project", "status": "open", "priority": 2, "assignee": "pablo", "created": "2026-03-01", "updated": "2026-03-13"}, "tags": ["backend"], "content": "# Title\n...", "backlinks": ["other.md"], "outgoing_links": ["ref.md"]}
```

## Output

If `-o` was given, write the JSONL to that file path and confirm.
If no output file, present the JSONL content directly.

Show summary: "Exported X notes to JSONL format."

## Follow-ups

- Import notes from JSONL: `/obsidian:import`
- View vault stats: `/obsidian:stats`
