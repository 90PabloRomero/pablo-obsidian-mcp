---
description: Synchronize vault via Obsidian Sync or git
argument-hint: [status|trigger]
---

Synchronize the vault using Obsidian Sync if available, otherwise fallback to git.

- $1: Subcommand (status, trigger). Defaults to "status".

## Detection strategy

1. Try `obsidian sync` via CLI to check if Obsidian Sync is available
2. If it works, use Obsidian Sync as the sync mechanism
3. If it fails, check if the vault directory is a git repository (run `git -C <vault-path> status`)
4. If git is available, use git as the sync mechanism
5. If neither is available, inform the user that no sync mechanism is configured

## status (default)

### With Obsidian Sync
Run `obsidian sync` and present the sync status.

### With git
Run `git -C <vault-path> status` and present:
- Current branch
- Uncommitted changes count
- Ahead/behind remote count

## trigger

### With Obsidian Sync
Run `obsidian sync` to trigger a sync and confirm completion.

### With git
1. Run `git -C <vault-path> add -A` to stage all changes
2. Run `git -C <vault-path> commit -m "vault sync <ISO 8601 timestamp>"` to commit
3. Run `git -C <vault-path> push` to push to remote
4. If any step fails (e.g. nothing to commit, no remote), inform the user
5. Confirm what was synced

## Follow-ups

- Check vault stats: `/obsidian:stats`
- View recent changes: suggest `git -C <vault-path> log --oneline -5`
