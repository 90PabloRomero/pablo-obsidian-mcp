import { execFile } from "child_process";
import { promisify } from "util";

const exec = promisify(execFile);

interface CliOptions {
  vault?: string;
  format?: "json" | "tsv" | "csv" | "text" | "yaml";
  timeout?: number;
}

const DEFAULT_TIMEOUT = 10_000;

function buildArgs(
  command: string,
  params: Record<string, string | number | boolean | undefined>,
): string[] {
  const parts = command.split(/\s+/);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (typeof value === "boolean") {
      if (value) parts.push(key);
    } else {
      parts.push(`${key}=${String(value)}`);
    }
  }
  return parts;
}

export async function obsidian(
  command: string,
  params: Record<string, string | number | boolean | undefined> = {},
  options: CliOptions = {},
): Promise<string> {
  const vaultName = options.vault ?? process.env.OBSIDIAN_VAULT_NAME;
  const args: string[] = [];

  if (vaultName) {
    args.push(`vault=${vaultName}`);
  }

  args.push(...buildArgs(command, params));

  if (options.format) {
    args.push(`format=${options.format}`);
  }

  const { stdout, stderr } = await exec("obsidian", args, {
    timeout: options.timeout ?? DEFAULT_TIMEOUT,
  });

  if (stderr && !stdout) {
    throw new Error(stderr.trim());
  }

  return stdout.trim();
}

export async function obsidianJson<T>(
  command: string,
  params: Record<string, string | number | boolean | undefined> = {},
  options: Omit<CliOptions, "format"> = {},
): Promise<T> {
  const raw = await obsidian(command, params, { ...options, format: "json" });
  return JSON.parse(raw) as T;
}
