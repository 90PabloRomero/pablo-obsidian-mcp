---
description: Search vault content by text query
argument-hint: <query> [--path] [--limit]
---

Search notes by text content using Obsidian's indexed search.

- $1: Search query (required). Supports property syntax like `status::open`
- `--path`: Filter by folder
- `--limit`: Max results (default: 20)

If the query is missing, ask the user what they want to search for.

## Strategy

1. Call `search_notes` with the query and optional path/limit filters
2. Present results as a list: note path and match preview
3. If the user wants to see matching lines in context, call `search_context` with the same query to get grep-style output with surrounding lines

## Property syntax

Obsidian CLI supports searching frontmatter properties directly:
- `status::open` - find notes with status open
- `priority::0` - find critical priority notes
- `type::project` - find project notes
- `assignee::pablo` - find notes assigned to pablo

These can be combined with text: `status::open authentication` finds open notes containing "authentication".

Mention this feature if the user seems unaware of it.

## Output

For each result show:
- Note path
- Match preview (first matching line or property match)

If more than 10 results, show count and ask if the user wants to narrow the search.

## Follow-ups

- View a result in detail: `/obsidian:show <path>`
- For advanced frontmatter filtering: `/obsidian:list`
- Read the full content of a match: use `read_note`
