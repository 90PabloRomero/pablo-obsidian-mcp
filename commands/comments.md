---
description: View or add comments on a note using callouts
argument-hint: [path] [text]
---

Manage comments on a note using Obsidian callouts in a dedicated `## Comments` section.

## Subcommands

If $1 is "view", show existing comments. Otherwise, treat all arguments as an add operation (default).

### Add (default)

- $1: Note path
- $2+: Comment text

If arguments are missing, ask the user for the note path and comment text.

Steps:
1. Read the note with `read_note` to check if a `## Comments` section exists
2. Build the callout block:
   ```
   > [!comment] claude - <current date YYYY-MM-DD>
   > <comment text>
   ```
3. If no `## Comments` section exists, append both the heading and the callout:
   ```

   ## Comments

   > [!comment] claude - 2026-03-13
   > Comment text here
   ```
4. If the section exists, append just the callout after the existing comments
5. Use `append_to_note` to write
6. Update the `updated` property with `set_property` to current timestamp
7. Confirm by showing the added callout

### View

- $1: "view"
- $2: Note path

Steps:
1. Read the note with `read_note`
2. Find the `## Comments` section
3. Extract all callout blocks (`> [!comment]` lines)
4. Present them as a list with author, date, and text
5. If no comments found, inform the user

## Path resolution

If the given path does not match an existing note exactly, use `find_notes_by_name` to search by filename substring.

## Follow-ups

- View the full note: `/obsidian:show <path>`
- Add another comment: `/obsidian:comments <path> <text>`
