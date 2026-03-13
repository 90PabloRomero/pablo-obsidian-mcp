import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { obsidian } from "../cli.ts";
import { compactResults } from "../compact.ts";
import { writeFile, mkdir } from "fs/promises";
import { resolve, dirname } from "path";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

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

export function registerAttachmentTools(server: McpServer): void {
  server.registerTool(
    "list_attachments",
    {
      description:
        "List all non-markdown files (images, PDFs, etc.) in the vault",
      inputSchema: z.object({
        folder: z
          .string()
          .optional()
          .describe("Filter by folder"),
      }),
    },
    async ({ folder }) => {
      const raw = await obsidian("files", { folder });
      const allFiles = raw.split("\n").filter(Boolean);
      const attachments = allFiles.filter((f) => !f.endsWith(".md"));

      if (attachments.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No attachments found in the vault",
            },
          ],
        };
      }

      const results = attachments.map((path) => ({
        name: path.split("/").pop()!,
        path,
      }));

      const compacted = compactResults(results, {
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
        folder: z
          .string()
          .optional()
          .describe("Folder to save the image in (default: 'attachments')"),
      }),
    },
    async ({ path, imageData, fileName, caption, folder }) => {
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
            { type: "text" as const, text: "Invalid base64 data" },
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
      const vaultPath = (await obsidian("vault", { info: "path" })).trim();
      const imagePath = `${targetFolder}/${fileName}`;
      const fullPath = resolve(vaultPath, imagePath);
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, buffer);

      const embed = caption
        ? `![[${fileName}|${caption}]]`
        : `![[${fileName}]]`;

      await obsidian("append", { path, content: embed });

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
