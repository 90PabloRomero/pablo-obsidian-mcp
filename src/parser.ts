export interface TaskItem {
  line: number;
  text: string;
  done: boolean;
}

export interface Frontmatter {
  [key: string]: unknown;
}

export function extractTags(content: string): string[] {
  const tags = new Set<string>();
  const lines = content.split("\n");

  for (const line of lines) {
    if (line.startsWith("#") && line.match(/^#{1,6}\s/)) continue;

    const matches = line.matchAll(/(?:^|\s)#([a-zA-Z][\w\-/]*)/g);
    for (const match of matches) {
      tags.add(match[1]!);
    }
  }

  return [...tags].sort();
}

export function extractWikiLinks(content: string): string[] {
  const links = new Set<string>();
  const matches = content.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g);

  for (const match of matches) {
    links.add(match[1]!.trim());
  }

  return [...links].sort();
}

export function extractTasks(content: string): TaskItem[] {
  const tasks: TaskItem[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i]!.match(/^[\s]*- \[([ xX])\]\s+(.+)/);
    if (match) {
      tasks.push({
        line: i + 1,
        text: match[2]!,
        done: match[1] !== " ",
      });
    }
  }

  return tasks;
}

export function extractFrontmatter(
  content: string,
): Frontmatter | null {
  if (!content.startsWith("---")) return null;

  const endIndex = content.indexOf("---", 3);
  if (endIndex === -1) return null;

  const yaml = content.substring(3, endIndex).trim();
  const result: Frontmatter = {};

  for (const line of yaml.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();
    result[key] = value;
  }

  return result;
}
