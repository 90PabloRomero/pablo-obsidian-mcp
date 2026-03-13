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

## Creating the note

Use Obsidian CLI to create the note. If a matching template exists for the type, use it:

```
obsidian create path={path}.md template={type} overwrite
```

If no template exists, create with initial content based on type (see type sections below).

## Setting properties

After creating the file, set structured properties using Obsidian CLI with native typing:

```
obsidian property:set name=type value={type} type=text file={name}
obsidian property:set name=status value=open type=text file={name}
obsidian property:set name=priority value={priority} type=number file={name}
obsidian property:set name=tags value={tags} type=list file={name}
obsidian property:set name=created value={ISO 8601 now} type=datetime file={name}
obsidian property:set name=updated value={ISO 8601 now} type=datetime file={name}
```

If assignee is provided:
```
obsidian property:set name=assignee value={assignee} type=text file={name}
```

## Type: project

Content (after frontmatter set by property:set):

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

After creating a project note, add entry to Projects.md:
```
obsidian append file=Projects content="- [[{name}]]"
```

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

## After creating any note

1. Show the created note path, type, and priority
2. Ask the user if they want to add wiki-links to existing notes
3. If type is project, confirm the entry was added to Projects/Projects.md
