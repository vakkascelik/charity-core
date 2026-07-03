"use client";
import { useRef, useState } from "react";
import { Icon } from "../Icon";

const inp: React.CSSProperties = {
  width: "100%",
  height: 44,
  borderRadius: 10,
  border: "1px solid var(--color-hairline)",
  padding: "0 14px",
  fontSize: 14.5,
  color: "var(--color-ink)",
  background: "var(--color-canvas)",
};

async function uploadFiles(files: File[]): Promise<string[]> {
  const fd = new FormData();
  for (const f of files) fd.append("file", f);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Upload failed (${res.status})`);
  }
  const data = (await res.json()) as { urls: string[] };
  return data.urls;
}

function DropZone({
  multiple,
  onUploaded,
}: {
  multiple: boolean;
  onUploaded: (urls: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handle(list: FileList | null) {
    if (!list || list.length === 0) return;
    setBusy(true);
    setErr(null);
    try {
      const urls = await uploadFiles(Array.from(list));
      onUploaded(urls);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files);
        }}
        style={{
          width: "100%",
          padding: "16px 14px",
          borderRadius: 10,
          border: `1.5px dashed ${drag ? "var(--color-primary)" : "var(--color-hairline)"}`,
          background: drag ? "var(--color-surface-soft)" : "var(--color-canvas)",
          color: "var(--color-body)",
          cursor: busy ? "wait" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 14,
        }}
      >
        <Icon name={busy ? "upload" : "image"} size={18} />
        {busy
          ? "Uploading…"
          : multiple
            ? "Upload images — click or drop files"
            : "Upload an image — click or drop a file"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => handle(e.target.files)}
      />
      {err && (
        <p style={{ color: "var(--color-error)", fontSize: 12.5, marginTop: 6 }}>
          {err}
        </p>
      )}
    </div>
  );
}

/** Single cover image: upload or paste a URL. */
export function ImageInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {value && (
        <div
          style={{
            height: 150,
            borderRadius: 10,
            backgroundImage: `url(${value})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: "1px solid var(--color-hairline)",
          }}
        />
      )}
      <DropZone multiple={false} onUploaded={(urls) => urls[0] && onChange(urls[0])} />
      <input
        style={inp}
        value={value ?? ""}
        placeholder="…or paste an image URL"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Multiple images (a gallery): upload several, reorder via remove, or paste URLs. */
export function GalleryInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const list = Array.isArray(value) ? value : [];
  const [url, setUrl] = useState("");

  const remove = (i: number) => onChange(list.filter((_, idx) => idx !== i));
  const add = (urls: string[]) => onChange([...list, ...urls]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {list.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(86px, 1fr))",
            gap: 8,
          }}
        >
          {list.map((src, i) => (
            <div
              key={src + i}
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                borderRadius: 8,
                backgroundImage: `url(${src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                border: "1px solid var(--color-hairline)",
              }}
            >
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove image"
                title="Remove"
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: "none",
                  background: "rgba(20,20,19,0.6)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Icon name="x" size={13} color="#fff" />
              </button>
            </div>
          ))}
        </div>
      )}
      <DropZone multiple onUploaded={add} />
      <div style={{ display: "flex", gap: 8 }}>
        <input
          style={{ ...inp, flex: 1 }}
          value={url}
          placeholder="…or paste an image URL"
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && url.trim()) {
              e.preventDefault();
              add([url.trim()]);
              setUrl("");
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (url.trim()) {
              add([url.trim()]);
              setUrl("");
            }
          }}
          style={{
            ...inp,
            width: "auto",
            padding: "0 16px",
            cursor: "pointer",
            background: "var(--color-surface-soft)",
            fontWeight: 600,
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
