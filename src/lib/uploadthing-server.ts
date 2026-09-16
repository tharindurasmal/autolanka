import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();

export async function deleteUploadedFiles(keys: string[]) {
  if (keys.length === 0) return;
  try {
    await utapi.deleteFiles(keys);
  } catch (err) {
    // Don't fail the whole delete because cleanup failed — just log it.
    console.error("Failed to delete files from UploadThing:", err);
  }
}