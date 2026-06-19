// Server-side uploads to Supabase Storage.
//
// Uses the service-role key, which bypasses Storage RLS, so this module must
// only ever run on the server (it is imported by admin API routes). The key is
// read from SUPABASE_SERVICE_ROLE_KEY and is never sent to the browser.
//
// When the key (or URL) is missing, `storageConfigured()` returns false and the
// admin UI falls back to pasting an image URL by hand.

const BUCKET = "media";

function env() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, key };
}

export function storageConfigured(): boolean {
  const { url, key } = env();
  return Boolean(url && key);
}

/** Public URL for an object already stored in the media bucket. */
export function publicUrl(path: string): string {
  const { url } = env();
  return `${url}/storage/v1/object/public/${BUCKET}/${path}`;
}

const SAFE = /[^a-zA-Z0-9._-]+/g;

/** A collision-resistant, URL-safe object path that keeps the file extension. */
export function objectPath(filename: string): string {
  const dot = filename.lastIndexOf(".");
  const ext = dot >= 0 ? filename.slice(dot + 1).toLowerCase().replace(SAFE, "") : "";
  const base = (dot >= 0 ? filename.slice(0, dot) : filename)
    .toLowerCase()
    .replace(SAFE, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "file";
  const stamp = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return ext ? `${base}-${stamp}.${ext}` : `${base}-${stamp}`;
}

/**
 * Upload one file to the media bucket and return its public URL.
 * Throws if storage is not configured or Supabase rejects the upload.
 */
export async function uploadToStorage(
  file: { name: string; type: string; bytes: ArrayBuffer },
): Promise<string> {
  const { url, key } = env();
  if (!url || !key) throw new Error("Supabase storage is not configured");

  const path = objectPath(file.name);
  const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "content-type": file.type || "application/octet-stream",
      "cache-control": "31536000", // 1 year — uploads are immutable (unique path)
      "x-upsert": "false",
    },
    body: file.bytes,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Upload failed (${res.status}): ${detail}`);
  }
  return publicUrl(path);
}
