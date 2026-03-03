import { readdir, readFile, writeFile, unlink, mkdir, stat, rm, rename } from "fs/promises";
import { join, relative, resolve, normalize, basename, dirname } from "path";

export interface NoteInfo {
  name: string;
  path: string;
  size: number;
  modified: string;
}

export interface AttachmentInfo {
  name: string;
  path: string;
  size: number;
  referenced: boolean;
}

export class VaultManager {
  readonly root: string;

  constructor(vaultPath: string) {
    this.root = resolve(vaultPath);
  }

  private resolveSafe(relativePath: string): string {
    const resolved = resolve(this.root, normalize(relativePath));
    if (!resolved.startsWith(this.root)) {
      throw new Error(`Path traversal detected: ${relativePath}`);
    }
    return resolved;
  }

  private toRelative(absolutePath: string): string {
    return relative(this.root, absolutePath);
  }

  async listFiles(subpath?: string): Promise<NoteInfo[]> {
    const dir = subpath ? this.resolveSafe(subpath) : this.root;
    const results: NoteInfo[] = [];
    await this.walkDir(dir, results);
    return results.sort((a, b) => a.path.localeCompare(b.path));
  }

  private async walkDir(dir: string, results: NoteInfo[]): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.name.startsWith(".")) continue;

      if (entry.isDirectory()) {
        await this.walkDir(fullPath, results);
      } else if (entry.name.endsWith(".md")) {
        const info = await stat(fullPath);
        results.push({
          name: entry.name.replace(/\.md$/, ""),
          path: this.toRelative(fullPath),
          size: info.size,
          modified: info.mtime.toISOString(),
        });
      }
    }
  }

  async listAttachments(): Promise<AttachmentInfo[]> {
    const allRefs = new Set<string>();
    const notes = await this.listFiles();
    for (const note of notes) {
      const content = await readFile(resolve(this.root, note.path), "utf-8");
      const matches = content.matchAll(/!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g);
      for (const m of matches) {
        allRefs.add(m[1]!.trim());
      }
    }

    const results: AttachmentInfo[] = [];
    await this.walkAttachments(this.root, results, allRefs);
    return results.sort((a, b) => a.path.localeCompare(b.path));
  }

  private async walkAttachments(
    dir: string,
    results: AttachmentInfo[],
    refs: Set<string>,
  ): Promise<void> {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.name.startsWith(".")) continue;

      if (entry.isDirectory()) {
        await this.walkAttachments(fullPath, results, refs);
      } else if (!entry.name.endsWith(".md")) {
        const info = await stat(fullPath);
        const relPath = this.toRelative(fullPath);
        results.push({
          name: entry.name,
          path: relPath,
          size: info.size,
          referenced: refs.has(entry.name) || refs.has(relPath),
        });
      }
    }
  }

  async moveFile(fromRelative: string, toRelative: string): Promise<void> {
    const fromFull = this.resolveSafe(fromRelative);
    const toFull = this.resolveSafe(toRelative);
    await mkdir(dirname(toFull), { recursive: true });
    await rename(fromFull, toFull);
  }

  async getFileInfo(relativePath: string): Promise<NoteInfo> {
    const fullPath = this.resolveSafe(relativePath);
    const info = await stat(fullPath);
    const name = basename(fullPath).replace(/\.md$/, "");
    return {
      name,
      path: this.toRelative(fullPath),
      size: info.size,
      modified: info.mtime.toISOString(),
    };
  }

  async readFile(relativePath: string): Promise<string> {
    const fullPath = this.resolveSafe(relativePath);
    return readFile(fullPath, "utf-8");
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = this.resolveSafe(relativePath);
    const dir = fullPath.substring(0, fullPath.lastIndexOf("/"));
    await mkdir(dir, { recursive: true });
    await writeFile(fullPath, content, "utf-8");
  }

  async writeBinary(relativePath: string, data: Buffer): Promise<void> {
    const fullPath = this.resolveSafe(relativePath);
    const dir = fullPath.substring(0, fullPath.lastIndexOf("/"));
    await mkdir(dir, { recursive: true });
    await writeFile(fullPath, data);
  }

  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = this.resolveSafe(relativePath);
    await unlink(fullPath);
  }

  async deleteDir(relativePath: string): Promise<{ deleted: number }> {
    const fullPath = this.resolveSafe(relativePath);
    const info = await stat(fullPath);
    if (!info.isDirectory()) {
      throw new Error(`Not a directory: ${relativePath}`);
    }
    const notes = await this.listFiles(relativePath);
    await rm(fullPath, { recursive: true });
    return { deleted: notes.length };
  }

  async exists(relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.resolveSafe(relativePath);
      await stat(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async readLine(relativePath: string, lineNumber: number): Promise<string> {
    const content = await this.readFile(relativePath);
    const lines = content.split("\n");
    if (lineNumber < 1 || lineNumber > lines.length) {
      throw new Error(
        `Line ${lineNumber} out of range (1-${lines.length})`,
      );
    }
    return lines[lineNumber - 1]!;
  }

  async replaceLine(
    relativePath: string,
    lineNumber: number,
    newLine: string,
  ): Promise<void> {
    const content = await this.readFile(relativePath);
    const lines = content.split("\n");
    if (lineNumber < 1 || lineNumber > lines.length) {
      throw new Error(
        `Line ${lineNumber} out of range (1-${lines.length})`,
      );
    }
    lines[lineNumber - 1] = newLine;
    await this.writeFile(relativePath, lines.join("\n"));
  }
}
