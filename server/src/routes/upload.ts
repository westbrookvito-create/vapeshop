import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, "..", "..", "data", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const MIME_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const uploadRouter = Router();

uploadRouter.post("/", (req, res) => {
  const { dataUrl } = req.body as { dataUrl?: string };
  if (!dataUrl || !dataUrl.startsWith("data:")) {
    return res.status(400).json({ error: "invalid_image" });
  }
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) return res.status(400).json({ error: "invalid_image" });
  const [, mime, base64] = match;
  const ext = MIME_EXT[mime];
  if (!ext) return res.status(400).json({ error: "unsupported_type" });

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length > 6 * 1024 * 1024) {
    return res.status(400).json({ error: "file_too_large" });
  }

  const filename = `${nanoid(12)}.${ext}`;
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);
  res.status(201).json({ url: `/uploads/${filename}` });
});
