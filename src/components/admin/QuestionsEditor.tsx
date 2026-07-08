"use client";
import { useState } from "react";
import { Icon } from "../Icon";
import { Btn } from "../Btn";

/**
 * Drawer editor for per-record custom form questions (CrudView field type
 * "questions"). Value shape: [{ label, type: "text"|"select"|"yesno",
 * required, options?: string[] }] — the app's API route is expected to
 * sanitise on save.
 */

type Question = {
  label: string;
  type: "text" | "select" | "yesno";
  required?: boolean;
  options?: string[];
};

/** Internal row: options kept as raw text so typing commas works. */
type Draft = Question & { optionsText: string };

const TYPE_LABELS: Array<[Question["type"], string]> = [
  ["text", "Free text"],
  ["select", "Choice list"],
  ["yesno", "Yes / No"],
];

const inp: React.CSSProperties = {
  width: "100%",
  height: 38,
  borderRadius: 8,
  border: "1px solid var(--color-hairline)",
  padding: "0 12px",
  fontSize: 13.5,
  color: "var(--color-ink)",
  background: "var(--color-canvas)",
};

export function QuestionsEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (v: Question[]) => void;
}) {
  const [items, setItems] = useState<Draft[]>(() =>
    (Array.isArray(value) ? (value as Question[]) : []).map((q) => ({
      label: q?.label ?? "",
      type: q?.type === "select" || q?.type === "yesno" ? q.type : "text",
      required: Boolean(q?.required),
      optionsText: Array.isArray(q?.options) ? q.options.join(", ") : "",
    })),
  );

  function commit(next: Draft[]) {
    setItems(next);
    onChange(
      next.map(({ optionsText, ...q }) => ({
        ...q,
        options:
          q.type === "select"
            ? optionsText.split(",").map((s) => s.trim()).filter(Boolean)
            : undefined,
      })),
    );
  }

  const update = (i: number, patch: Partial<Draft>) =>
    commit(items.map((q, j) => (j === i ? { ...q, ...patch } : q)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((q, i) => (
        <div
          key={i}
          style={{
            border: "1px solid var(--color-hairline)",
            borderRadius: 10,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            background: "var(--color-surface-soft)",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ ...inp, flex: 1 }}
              placeholder={'Question — e.g. "Dietary requirements"'}
              value={q.label}
              onChange={(e) => update(i, { label: e.target.value })}
            />
            <button
              type="button"
              title="Remove question"
              onClick={() => commit(items.filter((_, j) => j !== i))}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}
            >
              <Icon name="trash" size={15} color="var(--color-error)" />
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              style={{ ...inp, width: 130, flexShrink: 0 }}
              value={q.type}
              onChange={(e) => update(i, { type: e.target.value as Question["type"] })}
            >
              {TYPE_LABELS.map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
            {q.type === "select" && (
              <input
                style={{ ...inp, flex: 1 }}
                placeholder="Choices, comma-separated — e.g. Vegetarian, Halal, None"
                value={q.optionsText}
                onChange={(e) => update(i, { optionsText: e.target.value })}
              />
            )}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "var(--color-body)",
                marginLeft: "auto",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(q.required)}
                onChange={(e) => update(i, { required: e.target.checked })}
              />
              Required
            </label>
          </div>
        </div>
      ))}
      <div>
        <Btn
          kind="secondary"
          size="sm"
          icon="plus"
          onClick={() =>
            commit([...items, { label: "", type: "text", required: false, optionsText: "" }])
          }
        >
          Add question
        </Btn>
      </div>
      {items.length === 0 && (
        <p style={{ fontSize: 12.5, color: "var(--color-muted)", margin: 0 }}>
          No extra questions — the form asks only name, email and guest count.
        </p>
      )}
    </div>
  );
}
