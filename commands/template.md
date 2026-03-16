---
description: Manage Obsidian note templates
argument-hint: list|show|create [name]
---

Manage note templates stored in the Obsidian vault's templates folder.

## Subcommands

- $1: Subcommand (list, show, create). Defaults to "list".
- $2: Template name (for show/create)

### list

List all available templates:
1. Run `obsidian templates` via CLI to get available templates
2. Present as a list with names

### show [name]

Show the content of a specific template:
1. If $2 given, use it. Otherwise ask which template to show
2. Run `obsidian template:read name=<name>` to get template content
3. Present the full template with frontmatter and body

### create [name]

Create a new template:
1. If $2 given, use it as name. Otherwise ask for a name
2. Ask the user what type of note this template is for
3. Build the template with appropriate frontmatter and structure:
   - project: mermaid diagram section, wiki-links section, tasks
   - moc: grouped wiki-links sections
   - note: simple content with references
   - decision: Decision, Rationale, Alternatives, Affects sections
4. Create the file in the templates folder using `create_note`
5. Confirm creation

## Follow-ups

- Create a note from template: `/obsidian:create <path>` (will ask for template)
- View all templates: `/obsidian:template list`
