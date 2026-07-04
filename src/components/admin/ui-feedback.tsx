"use client";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * Admin feedback primitives shared by the charity apps: non-blocking toasts and
 * an async confirm dialog that replace the browser's `alert()` / `confirm()`.
 * Brand-agnostic — status colours read app CSS vars with neutral fallbacks.
 *
 * Wire once near the admin root (the app's AdminShell wraps children in
 * <AdminFeedbackProvider>). Consume via `useToast()` / `useConfirm()`.
 */

// ---- Toasts -----------------------------------------------------------------

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; kind: ToastKind; message: string };

type ToastApi = {
  show: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

const noopToast: ToastApi = { show: () => {}, success: () => {}, error: () => {} };
const ToastContext = createContext<ToastApi>(noopToast);

const KIND_COLOR: Record<ToastKind, string> = {
  success: "var(--color-success, #16a34a)",
  error: "var(--color-error, #dc2626)",
  info: "var(--color-accent-teal, #0ea5a4)",
};

// ---- Confirm ----------------------------------------------------------------

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};
type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(async () => false);

// ---- Provider ---------------------------------------------------------------

export function AdminFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const remove = useCallback(
    (id: number) => setToasts((list) => list.filter((t) => t.id !== id)),
    [],
  );

  const show = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = Date.now() + Math.random();
      setToasts((list) => [...list, { id, kind, message }]);
      setTimeout(() => remove(id), 5000);
    },
    [remove],
  );

  const toastApi: ToastApi = {
    show,
    success: (m) => show(m, "success"),
    error: (m) => show(m, "error"),
  };

  const confirm = useCallback<ConfirmFn>(
    (options) => new Promise<boolean>((resolve) => setDialog({ options, resolve })),
    [],
  );

  const settle = (value: boolean) => {
    dialog?.resolve(value);
    setDialog(null);
  };

  return (
    <ToastContext.Provider value={toastApi}>
      <ConfirmContext.Provider value={confirm}>
        {children}

        {/* Toast stack */}
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            zIndex: 1000,
            maxWidth: "min(92vw, 380px)",
          }}
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              role="status"
              onClick={() => remove(t.id)}
              style={{
                cursor: "pointer",
                background: "var(--color-surface-dark, #1f2937)",
                color: "var(--color-on-dark, #fff)",
                borderLeft: `3px solid ${KIND_COLOR[t.kind]}`,
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 13.5,
                lineHeight: 1.45,
                boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
                animation: "adminToastIn 160ms ease-out",
              }}
            >
              {t.message}
            </div>
          ))}
        </div>

        {/* Confirm dialog */}
        {dialog && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => settle(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1001,
              background: "rgba(0,0,0,0.42)",
              display: "grid",
              placeItems: "center",
              padding: 20,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(92vw, 420px)",
                background: "var(--color-canvas, #fff)",
                border: "1px solid var(--color-hairline, #e5e7eb)",
                borderRadius: 14,
                padding: 24,
                boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
              }}
            >
              {dialog.options.title && (
                <h2
                  style={{
                    margin: "0 0 8px",
                    fontSize: 17,
                    color: "var(--color-ink, #111)",
                  }}
                >
                  {dialog.options.title}
                </h2>
              )}
              <p
                style={{
                  margin: 0,
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: "var(--color-body, #444)",
                }}
              >
                {dialog.options.message}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 22,
                }}
              >
                <button
                  type="button"
                  onClick={() => settle(false)}
                  style={dialogBtn(false, false)}
                >
                  {dialog.options.cancelLabel ?? "Cancel"}
                </button>
                <button
                  type="button"
                  autoFocus
                  onClick={() => settle(true)}
                  style={dialogBtn(true, !!dialog.options.danger)}
                >
                  {dialog.options.confirmLabel ?? "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`@keyframes adminToastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
}

function dialogBtn(primary: boolean, danger: boolean): CSSProperties {
  return {
    height: 40,
    padding: "0 18px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid transparent",
    background: primary
      ? danger
        ? "var(--color-error, #dc2626)"
        : "var(--color-primary, #111)"
      : "var(--color-canvas, #fff)",
    color: primary ? "#fff" : "var(--color-ink, #111)",
    borderColor: primary ? "transparent" : "var(--color-hairline, #e5e7eb)",
  };
}

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

export function useConfirm(): ConfirmFn {
  return useContext(ConfirmContext);
}
