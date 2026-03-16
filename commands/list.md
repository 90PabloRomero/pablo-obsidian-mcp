---
description: List notes with optional filters
argument-hint: [path] [--status] [--priority] [--type] [--assignee] [--tag]
---

List notes in the Obsidian vault with optional filtering. If $1 is provided, use it as a path filter (subfolder).

## Basic Filters

- **--status, -s**: Filter by status (open, in_progress, blocked, done, archived)
- **--priority, -p**: Filter by priority (0-4: 0=critical, 1=high, 2=medium, 3=low, 4=backlog)
- **--type, -t**: Filter by type (project, moc, note, decision)
- **--assignee, -a**: Filter by assignee
- **--tag, -l**: Filter by tags (comma-separated, must have ALL tags)
- **--tag-any**: Filter by tags (OR semantics, must have AT LEAST ONE)
- **--name**: Filter by filename text (case-insensitive substring match)
- **--limit, -n**: Limit number of results

## Advanced Filters

### Pattern Matching
- **--name-contains**: Search for text in filename (case-insensitive)
- **--content-contains**: Search for text in note content (case-insensitive)

### Date Ranges
- **--created-after**: Notes created after date (YYYY-MM-DD)
- **--created-before**: Notes created before date
- **--updated-after**: Notes updated after date
- **--updated-before**: Notes updated before date

### Priority Range
- **--priority-min**: Minimum priority (inclusive)
- **--priority-max**: Maximum priority (inclusive)

### Empty/Null Checks
- **--empty-content**: Find notes with no content beyond frontmatter
- **--no-assignee**: Find unassigned notes
- **--no-tags**: Find notes with no tags

## Strategy

Use Obsidian CLI commands to resolve filters. Prefer `base:query` when a Base file is configured, otherwise combine these commands:

### For frontmatter filters (status, priority, type, assignee)
Use Obsidian search with property syntax:
```
obsidian search query="status::open" path={path} limit={limit} format=json
```

Multiple property filters can be combined:
```
obsidian search query="status::open type::project" format=json
```

### For tag filters
```
obsidian tag name={tag} verbose
```

### For filename filters
```
obsidian search query="{name}" format=json
```

### For content search
```
obsidian search:context query="{text}" path={path} format=json
```

### For date ranges and empty checks
Read properties and filter post-query:
```
obsidian property:read name=created file={name}
```

### For structured queries (preferred when Base exists)
```
obsidian base:query file={base} format=json
```

## Output

Present results as a clean table with columns:
- Name
- Path
- Type
- Status
- Priority
- Tags

If results exceed reasonable size, suggest narrowing with filters.

## Examples

- `/obsidian:list` - All notes
- `/obsidian:list Projects` - Notes under Projects/
- `/obsidian:list --status open` - Open notes
- `/obsidian:list --type project --priority 1` - High priority projects
- `/obsidian:list --tag backend` - Notes tagged backend
- `/obsidian:list --assignee pablo --status in_progress` - Pablo's in-progress work
- `/obsidian:list --created-after 2026-03-01 --type decision` - Recent decisions
- `/obsidian:list --no-assignee --priority-min 0 --priority-max 1` - Unassigned critical/high work
- `/obsidian:list --content-contains "TODO" --status open` - Open notes mentioning TODO
- `/obsidian:list --empty-content --type note` - Empty notes
