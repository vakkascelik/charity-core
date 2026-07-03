"use client";
import { createContext, useContext, type ReactNode } from "react";
import { fmtDate as coreFmtDate, fmtMoney as coreFmtMoney } from "../../lib/format";

/**
 * Supplies locale/currency-bound formatters to the shared admin components
 * (e.g. CrudView) without those components importing any app-specific config.
 * The host app wraps its admin chrome in <FormatProvider locale currency>
 * (see the app's AdminShell). Falls back to a neutral en-US/USD default so a
 * component rendered outside a provider still renders sensibly.
 */
type Formatters = {
  fmtDate: (value: Date | string) => string;
  fmtMoney: (value: number | string) => string;
};

const FALLBACK: Formatters = {
  fmtDate: (v) => coreFmtDate(v, "en-US"),
  fmtMoney: (v) => coreFmtMoney(v, "en-US", "USD"),
};

const FormatContext = createContext<Formatters>(FALLBACK);

export function FormatProvider({
  locale,
  currency,
  children,
}: {
  locale: string;
  currency: string;
  children: ReactNode;
}) {
  const value: Formatters = {
    fmtDate: (v) => coreFmtDate(v, locale),
    fmtMoney: (v) => coreFmtMoney(v, locale, currency),
  };
  return (
    <FormatContext.Provider value={value}>{children}</FormatContext.Provider>
  );
}

export function useFormat(): Formatters {
  return useContext(FormatContext);
}
