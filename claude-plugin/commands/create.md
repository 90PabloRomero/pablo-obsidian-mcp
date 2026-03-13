---
description: Create a new note interactively
argument-hint: [path] [type] [priority]
---

Create a new note in the Obsidian vault. If arguments are provided:
- $1: Note path relative to vault root (e.g. "Projects/my-project")
- $2: Note type - one of: project, moc, note, decision (default: note)
- $3: Priority - 0 to 4 (0=critical, 1=high, 2=medium, 3=low, 4=backlog; default: 2)

If arguments are missing, ask the user for:
1. Note path (required)
2. Note type (default: note)
3. Priority (default: 2)
4. Tags (optional, comma-separated)

Use the obsidian MCP `create_note` tool to create the note. Every note MUST include frontmatter with structured fields. The content structure after the frontmatter depends on the type:

## Type: project

```markdown
---
type: project
status: open
priority: {$3 or 2}
assignee: {ask or leave empty}
tags: [{user provided tags}]
created: {ISO 8601 now}
updated: {ISO 8601 now}
---

# {title}

## Overview

{ask user for a brief description}

- **Repo**: {ask if applicable}
- **Status**: {ask}

## Stack

{ask user}

## Architecture Chart

\```mermaid
graph LR
    A["Component A"] --> B["Component B"]
\```

## Key technical decisions

- {to be filled}

## Links

- {wiki-links to related notes}
```

After creating a project note, also use `read_note` on `Projects/Projects.md`, then `edit_note` to add the new project entry with a wiki-link.

## Type: moc

```markdown
---
type: moc
status: open
priority: {$3 or 2}
tags: [{user provided tags}]
created: {ISO 8601 now}
updated: {ISO 8601 now}
---

# {title}

Map of content for {topic}.

## {Section 1}

- [[related-note-1|Label]]
- [[related-note-2|Label]]

## Links

- {wiki-links to related notes}
```

## Type: note

```markdown
---
type: note
status: open
priority: {$3 or 2}
tags: [{user provided tags}]
created: {ISO 8601 now}
updated: {ISO 8601 now}
---

# {title}

{ask user for content or leave blank}
```

## Type: decision

```markdown
---
type: decision
status: open
priority: {$3 or 2}
tags: [{user provided tags}]
created: {ISO 8601 now}
updated: {ISO 8601 now}
---

# {title}

## Context

{ask user: what is the problem or situation?}

## Options considered

1. {option 1}
2. {option 2}

## Decision

{ask user: what was decided and why}

## Consequences

- {what changes as a result}
```

After creating any note:
1. Show the created note path, type, and priority
2. Ask the user if they want to add wiki-links to existing notes
3. If type is project, confirm the entry was added to Projects/Projects.md
