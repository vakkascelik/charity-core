"use client";
import { useState, type CSSProperties, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type Kind = "primary" | "teal" | "secondary" | "ghost" | "onDark" | "dark";
type Size = "sm" | "md" | "lg";

export function Btn({
  children,
  kind = "primary",
  size = "md",
  onClick,
  icon,
  full = false,
  type = "button",
  href,
  target,
  disabled = false,
}: {
  children: ReactNode;
  kind?: Kind;
  size?: Size;
  onClick?: () => void;
  icon?: IconName | string;
  full?: boolean;
  type?: "button" | "submit" | "reset";
  href?: string;
  target?: "_blank";
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(false);

  const h = size === "lg" ? 50 : size === "sm" ? 38 : 44;
  const padX = size === "lg" ? 28 : size === "sm" ? 16 : 22;

  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: h,
    padding: `0 ${padX}px`,
    borderRadius: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    fontFamily: "var(--font-body)",
    fontSize: size === "lg" ? 16 : 14,
    fontWeight: 600,
    border: "1px solid transparent",
    transition: "all 150ms ease-out",
    width: full ? "100%" : "auto",
    whiteSpace: "nowrap",
    textDecoration: "none",
  };

  const kinds: Record<Kind, CSSProperties> = {
    primary: { background: "var(--color-primary)", color: "#fff" },
    teal: { background: "var(--color-accent-teal)", color: "#fff" },
    secondary: {
      background: "var(--color-canvas)",
      color: "var(--color-ink)",
      borderColor: "var(--color-hairline)",
    },
    ghost: { background: "transparent", color: "var(--color-ink)" },
    onDark: { background: "var(--color-canvas)", color: "var(--color-ink)" },
    dark: {
      background: "var(--color-surface-dark)",
      color: "var(--color-on-dark)",
    },
  };

  const hoverStyle: CSSProperties = !hover || disabled
    ? {}
    : kind === "primary"
      ? { background: "var(--color-primary-active)" }
      : kind === "teal"
        ? { background: "#24645d" }
        : kind === "secondary"
          ? { background: "var(--color-surface-soft)" }
          : kind === "onDark"
            ? { background: "#fff", transform: "translateY(-1px)" }
            : { background: "var(--color-surface-soft)" };

  const inner = (
    <>
      {children}
      {icon && <Icon name={icon} size={size === "lg" ? 19 : 17} />}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        style={{ ...base, ...kinds[kind], ...hoverStyle }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...kinds[kind], ...hoverStyle }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {inner}
    </button>
  );
}
