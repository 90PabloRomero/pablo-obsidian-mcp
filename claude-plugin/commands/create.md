---
description: Create a new note interactively
argument-hint: [path] [type]
---

Create a new note in the Obsidian vault. If arguments are provided:
- $1: Note path relative to vault root (e.g. "Projects/my-project")
- $2: Note type - one of: project, moc, note, decision (default: note)

If arguments are missing, ask the user for:
1. Note path (required)
2. Note type (default: note)

Use the obsidian MCP `create_note` tool to create the note. The content structure depends on the type:

## Type: project

```markdown
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
# {title}

{ask user for content or leave blank}
```

## Type: decision

```markdown
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
1. Show the created note path and type
2. Ask the user if they want to add wiki-links to existing notes
3. If type is project, confirm the entry was added to Projects/Projects.md
