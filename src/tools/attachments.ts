import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { VaultManager } from "../vault.ts";
import { basename } from "path";
import { compactResults } from "../compact.ts";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

interface ImageSignature {
  bytes: number[];
  type: string;
}

const IMAGE_SIGNATURES: ImageSignature[] = [
  { bytes: [0x89, 0x50, 0x4e, 0x47], type: "png" },
  { bytes: [0xff, 0xd8, 0xff], type: "jpeg" },
  { bytes: [0x52, 0x49, 0x46, 0x46], type: "webp" },
  { bytes: [0x47, 0x49, 0x46, 0x38], type: "gif" },
];

function detectImageType(buffer: Buffer): string | null {
  for (const sig of IMAGE_SIGNATURES) {
    if (sig.bytes.every((b, i) => buffer[i] === b)) {
      return sig.type;
    }
  }
  return null;
}

export function registerAttachmentTools(
  server: McpServer,
  vault: VaultManager,
): void {
  server.registerTool(
    "list_attachments",
    {
      description:
        "List all non-markdown files (images, PDFs, etc.) in the vault with reference status",
      inputSchema: z.object({
        orphansOnly: z
          .boolean()
          .optional()
          .describe(
            "If true, only return attachments not referenced by any note",
          ),
      }),
    },
    async ({ orphansOnly }) => {
      const attachments = await vault.listAttachments();
      const filtered = orphansOnly
        ? attachments.filter((a) => !a.referenced)
        : attachments;

      if (filtered.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: orphansOnly
                ? "No orphaned attachments found"
                : "No attachments found in the vault",
            },
          ],
        };
      }

      const compacted = compactResults(filtered, {
        entityName: "attachments",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(compacted, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "organize_attachments",
    {
      description:
        "Move all attachments into a designated folder (default: attachments/) and update all ![[]] references in notes",
      inputSchema: z.object({
        folder: z
          .string()
          .optional()
          .describe(
            "Target folder for attachments (default: 'attachments')",
          ),
        deleteOrphans: z
          .boolean()
          .optional()
          .describe(
            "If true, delete attachments not referenced by any note instead of moving them",
          ),
      }),
    },
    async ({ folder, deleteOrphans }) => {
      const targetFolder = folder ?? "attachments";
      const attachments = await vault.listAttachments();

      if (attachments.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No attachments to organize",
            },
          ],
        };
      }

      let moved = 0;
      let deleted = 0;
      let skipped = 0;

      const renames: { oldName: string; newPath: string }[] = [];

      for (const att of attachments) {
        const alreadyInTarget = att.path.startsWith(targetFolder + "/");
        if (alreadyInTarget) {
          skipped++;
          continue;
        }

        if (deleteOrphans && !att.referenced) {
          await vault.deleteFile(att.path);
          deleted++;
          continue;
        }

        const newPath = `${targetFolder}/${att.name}`;
        await vault.moveFile(att.path, newPath);
        renames.push({ oldName: att.name, newPath });
        moved++;
      }

      if (renames.length > 0) {
        const notes = await vault.listFiles();
        for (const note of notes) {
          let content = await vault.readFile(note.path);
          let changed = false;

          for (const { oldName, newPath } of renames) {
            const newName = basename(newPath);
            const pattern = `![[${oldName}]]`;
            const replacement = `![[${newName}]]`;
            if (content.includes(pattern) && oldName !== newName) {
              content = content.replaceAll(pattern, replacement);
              changed = true;
            }
          }

          if (changed) {
            await vault.writeFile(note.path, content);
          }
        }
      }

      const parts: string[] = [];
      if (moved > 0)
        parts.push(`${moved} moved to ${targetFolder}/`);
      if (deleted > 0) parts.push(`${deleted} orphans deleted`);
      if (skipped > 0)
        parts.push(`${skipped} already in ${targetFolder}/`);

      return {
        content: [
          {
            type: "text" as const,
            text: `Attachments organized: ${parts.join(", ")}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "insert_image",
    {
      description:
        "Save a base64-encoded image as an attachment and insert an embed into a note",
      inputSchema: z.object({
        path: z.string().describe("Path to the note to insert the image into"),
        imageData: z
          .string()
          .describe(
            "Base64-encoded image data (with or without data URI prefix)",
          ),
        fileName: z.string().describe("Name for the saved image file"),
        caption: z
          .string()
          .optional()
          .describe("Alt text / caption for the embed"),
        line: z
          .number()
          .optional()
          .describe("Line number to insert at (1-based). Appends to end if omitted"),
        folder: z
          .string()
          .optional()
          .describe("Folder to save the image in (default: 'attachments')"),
      }),
    },
    async ({ path, imageData, fileName, caption, line, folder }) => {
      const noteExists = await vault.exists(path);
      if (!noteExists) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Note not found: ${path}`,
            },
          ],
          isError: true,
        };
      }

      const base64Clean = imageData.replace(
        /^data:image\/[a-zA-Z+]+;base64,/,
        "",
      );

      let buffer: Buffer;
      try {
        buffer = Buffer.from(base64Clean, "base64");
      } catch {
        return {
          content: [
            {
              type: "text" as const,
              text: "Invalid base64 data",
            },
          ],
          isError: true,
        };
      }

      if (buffer.length > MAX_IMAGE_SIZE) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Image too large: ${(buffer.length / 1024 / 1024).toFixed(1)}MB (max 10MB)`,
            },
          ],
          isError: true,
        };
      }

      const imageType = detectImageType(buffer);
      if (!imageType) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Unsupported image format. Supported: PNG, JPEG, WebP, GIF",
            },
          ],
          isError: true,
        };
      }

      const targetFolder = folder ?? "attachments";
      const imagePath = `${targetFolder}/${fileName}`;
      await vault.writeBinary(imagePath, buffer);

      const embed = caption
        ? `![[${fileName}|${caption}]]`
        : `![[${fileName}]]`;

      const content = await vault.readFile(path);
      let updated: string;

      if (line !== undefined && line >= 1) {
        const lines = content.split("\n");
        const insertAt = Math.min(line - 1, lines.length);
        lines.splice(insertAt, 0, embed);
        updated = lines.join("\n");
      } else {
        const separator = content.endsWith("\n") ? "" : "\n";
        updated = content + separator + embed + "\n";
      }

      await vault.writeFile(path, updated);

      return {
        content: [
          {
            type: "text" as const,
            text: `Image saved to ${imagePath} and embedded in ${path}`,
          },
        ],
      };
    },
  );
}
