"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "../Icon";
import { Btn } from "../Btn";
import { Pill } from "../Pill";
import {
  card,
  PageTitle,
  StatusBadge,
  td,
  th,
} from "./primitives";
import { useFormat } from "./format-context";
import { ImageInput, GalleryInput } from "./ImageInput";

type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "toggle"
  | "select"
  | "tags"
  | "images";

export type CrudField = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  /** If true, the field acts as an image URL with a preview banner. */
  isImage?: boolean;
};

export type CrudConfig = {
  resource: string;
  title: string;
  sub: string;
  /** Override the singular label used in "New …" button (e.g. "story" for "News & Stories"). */
  singular?: string;
  /** Extra action node shown in the page title bar (e.g. an export button). */
  action?: React.ReactNode;
  /** columns to render in the table. `key` maps to a record property. */
  cols: Array<{ key: string; label: string; type?: "date" | "money" | "image" | "status" }>;
  fields: CrudField[];
  /** When true, no create/edit/delete; only the table. Useful for Donations. */
  readOnly?: boolean;
  /**
   * When true, hide the "New" button but keep edit/delete. Useful for tables
   * populated only by public form submissions (Volunteers, ContactMessages).
   */
  noCreate?: boolean;
  /**
   * When set, each row shows a link button (before Edit) to a related detail
   * page — e.g. an event's attendee/RSVP list. A URL template with `:key`
   * placeholders filled from the row, e.g. "/admin/events/:id/rsvps".
   * Must be a plain string, NOT a function: CrudView is a Client Component and
   * every prop crossing the Server→Client boundary has to be serialisable.
   */
  rowHref?: string;
  /** Icon + tooltip for the {@link rowHref} button. */
  rowHrefIcon?: string;
  rowHrefTitle?: string;
};

type Row = Record<string, any>;

export function CrudView({
  config,
  rows,
  defaultValues,
}: {
  config: CrudConfig;
  rows: Row[];
  defaultValues?: Row;
}) {
  const router = useRouter();
  const { fmtDate, fmtMoney } = useFormat();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = rows.filter((r) =>
    JSON.stringify(r).toLowerCase().includes(query.toLowerCase()),
  );

  const renderCell = (r: Row, col: CrudConfig["cols"][number]) => {
    const v = r[col.key];
    if (v === null || v === undefined) return "—";
    if (col.type === "image")
      return (
        <div style={{ height: 30, width: 80, display: "grid", placeItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={String(v)}
            alt=""
            style={{ maxHeight: 30, maxWidth: 80, objectFit: "contain" }}
          />
        </div>
      );
    if (col.type === "status") return <StatusBadge status={String(v)} />;
    if (col.type === "money") return fmtMoney(Number(v));
    if (col.type === "date") return fmtDate(v);
    if (col.key === "title" || col.key === "name")
      return <strong style={{ color: "var(--color-ink)" }}>{String(v)}</strong>;
    if (col.key === "accent") return <Pill tone={String(v)}>{String(v)}</Pill>;
    return String(v);
  };

  async function save(record: Row) {
    setBusy(true);
    try {
      const method = record.id ? "PATCH" : "POST";
      const url = record.id
        ? `/api/admin/${config.resource}/${record.id}`
        : `/api/admin/${config.resource}`;
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(record),
      });
      if (!res.ok) throw new Error(await res.text());
      setEditing(null);
      router.refresh();
    } catch (err) {
      alert("Save failed: " + (err instanceof Error ? err.message : err));
    } finally {
      setBusy(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this record?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/${config.resource}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (err) {
      alert("Delete failed: " + (err instanceof Error ? err.message : err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageTitle
        title={config.title}
        sub={config.sub}
        action={
          config.action ??
          (!config.readOnly && !config.noCreate && (
            <Btn
              kind="primary"
              size="sm"
              icon="plus"
              onClick={() => setEditing(defaultValues ? { ...defaultValues } : {})}
            >
              New {(config.singular ?? singularize(config.title)).toLowerCase()}
            </Btn>
          ))
        }
      />
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 18px",
            borderBottom: "1px solid var(--color-hairline)",
          }}
        >
          <div style={{ position: "relative", width: 280 }}>
            <Icon
              name="search"
              size={16}
              color="var(--color-muted)"
              style={{ position: "absolute", left: 12, top: 9 }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={"Search " + config.title.toLowerCase()}
              style={{
                width: "100%",
                height: 34,
                borderRadius: 8,
                border: "1px solid var(--color-hairline)",
                paddingLeft: 34,
                fontSize: 13.5,
                background: "var(--color-surface-soft)",
              }}
            />
          </div>
          <span style={{ fontSize: 13, color: "var(--color-muted)" }}>
            {filtered.length} {filtered.length === 1 ? "record" : "records"}
          </span>
        </div>
        <div className="thin-scroll" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {config.cols.map((c) => (
                  <th key={c.key} style={th}>
                    {c.label}
                  </th>
                ))}
                {!config.readOnly && (
                  <th style={{ ...th, textAlign: "right" }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id ?? Math.random()}
                  style={{ borderTop: "1px solid var(--color-hairline-soft)" }}
                >
                  {config.cols.map((c) => (
                    <td key={c.key} style={td}>
                      {renderCell(r, c)}
                    </td>
                  ))}
                  {!config.readOnly && (
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {config.rowHref && (
                        <Link
                          href={fillHref(config.rowHref, r)}
                          title={config.rowHrefTitle ?? "Open"}
                          style={{ ...iconBtn, display: "inline-flex" }}
                        >
                          <Icon
                            name={config.rowHrefIcon ?? "external"}
                            size={16}
                            color="var(--color-body)"
                          />
                        </Link>
                      )}
                      <button
                        onClick={() => setEditing(r)}
                        title="Edit"
                        style={iconBtn}
                      >
                        <Icon name="edit" size={16} color="var(--color-body)" />
                      </button>
                      <button
                        onClick={() => del(r.id)}
                        title="Delete"
                        style={iconBtn}
                      >
                        <Icon name="trash" size={16} color="var(--color-error)" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={config.cols.length + 1}
                    style={{
                      padding: 36,
                      textAlign: "center",
                      color: "var(--color-muted)",
                      fontSize: 14,
                    }}
                  >
                    No {config.title.toLowerCase()} yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {editing && (
        <EditDrawer
          config={config}
          record={editing}
          busy={busy}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 7,
  borderRadius: 7,
};

/** Fill a rowHref template like "/admin/events/:id/rsvps" from a row's fields. */
function fillHref(template: string, row: Row): string {
  return template.replace(/:(\w+)/g, (_, k) =>
    encodeURIComponent(String(row[k] ?? "")),
  );
}

function singularize(s: string) {
  return s.replace(/s$/, "");
}

const lbl: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--color-body-strong)",
  marginBottom: 7,
};
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
const txtarea: React.CSSProperties = {
  ...inp,
  height: "auto",
  minHeight: 120,
  padding: 14,
  resize: "vertical" as const,
};

function EditDrawer({
  config,
  record,
  busy,
  onClose,
  onSave,
}: {
  config: CrudConfig;
  record: Row;
  busy: boolean;
  onClose: () => void;
  onSave: (r: Row) => void;
}) {
  const [form, setForm] = useState<Row>({ ...record });
  const isNew = !form.id;
  const set = (k: string, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(20,20,19,0.4)",
        }}
      />
      <div
        className="thin-scroll"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 480,
          maxWidth: "92vw",
          background: "var(--color-canvas)",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.15)",
          overflowY: "auto",
          animation: "slideIn .25s ease-out",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 26px",
            borderBottom: "1px solid var(--color-hairline)",
            position: "sticky",
            top: 0,
            background: "var(--color-canvas)",
            zIndex: 2,
          }}
        >
          <h4 style={{ fontSize: 22 }}>
            {isNew ? "New " : "Edit "}
            {singularize(config.title).toLowerCase()}
          </h4>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <Icon name="x" size={22} />
          </button>
        </div>
        <div
          style={{
            padding: 26,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {config.fields.map((f) => (
            <div key={f.key}>
              <label style={lbl}>{f.label}</label>
              {f.type === "images" ? (
                <GalleryInput
                  value={form[f.key] ?? []}
                  onChange={(v) => set(f.key, v)}
                />
              ) : f.isImage ? (
                <ImageInput
                  value={form[f.key] ?? ""}
                  onChange={(v) => set(f.key, v)}
                />
              ) : f.type === "textarea" ? (
                <textarea
                  style={txtarea}
                  value={form[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              ) : f.type === "tags" ? (
                <TagPicker
                  value={Array.isArray(form[f.key]) ? form[f.key] : []}
                  options={f.options ?? []}
                  onChange={(v) => set(f.key, v)}
                />
              ) : f.type === "select" ? (
                <select
                  style={inp}
                  value={form[f.key] ?? f.options?.[0] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                >
                  {f.options?.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : f.type === "toggle" ? (
                <button
                  type="button"
                  onClick={() => set(f.key, !form[f.key])}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      width: 42,
                      height: 24,
                      borderRadius: 9999,
                      background: form[f.key]
                        ? "var(--color-primary)"
                        : "var(--color-surface-cream-strong)",
                      position: "relative",
                      transition: "background 150ms",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 2,
                        left: form[f.key] ? 20 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: 9999,
                        background: "#fff",
                        transition: "left 150ms",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      }}
                    />
                  </span>
                  <span style={{ fontSize: 14, color: "var(--color-body)" }}>
                    {form[f.key] ? "Yes" : "No"}
                  </span>
                </button>
              ) : (
                <input
                  type={
                    f.type === "number"
                      ? "number"
                      : f.type === "date"
                        ? "date"
                        : "text"
                  }
                  style={inp}
                  value={
                    f.type === "date" && form[f.key]
                      ? toDateInput(form[f.key])
                      : (form[f.key] ?? "")
                  }
                  onChange={(e) =>
                    set(
                      f.key,
                      f.type === "number"
                        ? e.target.value === ""
                          ? null
                          : +e.target.value
                        : e.target.value,
                    )
                  }
                />
              )}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "18px 26px",
            borderTop: "1px solid var(--color-hairline)",
            position: "sticky",
            bottom: 0,
            background: "var(--color-canvas)",
          }}
        >
          <Btn kind="secondary" onClick={onClose}>
            Cancel
          </Btn>
          <Btn
            kind="primary"
            full
            onClick={() => onSave(form)}
            icon="check"
            disabled={busy}
          >
            {busy ? "Saving…" : isNew ? "Create" : "Save changes"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/** Chip multi-select: toggle membership of each option in a string[] value. */
function TagPicker({
  value,
  options,
  onChange,
}: {
  value: string[];
  options: string[];
  onChange: (v: string[]) => void;
}) {
  // Keep showing values that are no longer in the registry so they can be removed.
  const all = [...new Set([...options, ...value])];
  const toggle = (t: string) =>
    onChange(value.includes(t) ? value.filter((x) => x !== t) : [...value, t]);
  if (all.length === 0) {
    return (
      <p style={{ fontSize: 13.5, color: "var(--color-muted)" }}>
        No labels defined yet — add some in the Labels box above the table.
      </p>
    );
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {all.map((t) => {
        const on = value.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => toggle(t)}
            style={{
              padding: "7px 14px",
              borderRadius: 9999,
              fontSize: 13.5,
              fontWeight: 500,
              cursor: "pointer",
              border: "1.5px solid " + (on ? "var(--color-primary)" : "var(--color-hairline)"),
              background: on ? "var(--color-primary)" : "var(--color-canvas)",
              color: on ? "#fff" : "var(--color-ink)",
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

function toDateInput(v: string | Date): string {
  const d = typeof v === "string" ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
