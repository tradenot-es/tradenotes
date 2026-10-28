import { mkdir, readdir, readFile, rm, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join, resolve } from "node:path";
import { env } from "./env.js";

const MAX_BYTES = 10 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};
const CONTENT_TYPES = Object.fromEntries(Object.entries(TYPES).map(([type, ext]) => [ext, type]));

const root = resolve(env.uploadDir);
const userDir = (userId: string) => join(root, userId);

/** Stores a screenshot and returns the URL path under which the owner can fetch it. */
export async function saveScreenshot(userId: string, file: File): Promise<string> {
  const ext = TYPES[file.type];
  if (!ext) throw new Error("Unsupported image type");
  if (file.size > MAX_BYTES) throw new Error("File too large (max 10 MB)");
  const name = `${randomUUID()}.${ext}`;
  await mkdir(userDir(userId), { recursive: true });
  await writeFile(join(userDir(userId), name), Buffer.from(await file.arrayBuffer()));
  return `/api/screenshots/${userId}/${name}`;
}

const SAFE_NAME = /^[0-9a-f-]{36}\.(png|jpg|webp|gif)$/;

export async function readScreenshot(userId: string, name: string) {
  if (!SAFE_NAME.test(name)) return null;
  try {
    const data = await readFile(join(userDir(userId), name));
    return { data, contentType: CONTENT_TYPES[name.split(".").pop()!] };
  } catch {
    return null;
  }
}

/** Deletes the file behind a screenshot URL, if it belongs to the user. */
export async function deleteScreenshotUrl(userId: string, url: string | null | undefined) {
  const prefix = `/api/screenshots/${userId}/`;
  if (!url?.startsWith(prefix)) return;
  const name = url.slice(prefix.length);
  if (SAFE_NAME.test(name)) await unlink(join(userDir(userId), name)).catch(() => {});
}

/** All screenshots of a user, for the data export. */
export async function listScreenshots(userId: string): Promise<string[]> {
  const names = await readdir(userDir(userId)).catch(() => [] as string[]);
  return names.filter((name) => SAFE_NAME.test(name)).sort();
}

export async function deleteUserFiles(userId: string) {
  await rm(userDir(userId), { recursive: true, force: true });
}
