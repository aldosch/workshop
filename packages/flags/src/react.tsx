"use client";

import { createContext, useContext } from "react";
import type { FlagKey, FlagValues } from "./flags";

const FlagsContext = createContext<FlagValues | null>(null);

/**
 * Provide resolved flag values to client components.
 *
 * Usage in a server component:
 *
 *   import { getFlags } from "@repo/flags";
 *   import { FlagsProvider } from "@repo/flags/react";
 *
 *   export default function Layout({ children }) {
 *     const flags = getFlags();
 *     return <FlagsProvider value={flags}>{children}</FlagsProvider>;
 *   }
 */
export function FlagsProvider({
  value,
  children,
}: {
  value: FlagValues;
  children: React.ReactNode;
}) {
  return (
    <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>
  );
}

/**
 * Read a single flag in a client component.
 *
 * Must be used inside a <FlagsProvider>.
 */
export function useFlag(key: FlagKey): boolean {
  const ctx = useContext(FlagsContext);
  if (ctx === null) {
    throw new Error("useFlag must be used within a <FlagsProvider>");
  }
  return ctx[key];
}

/**
 * Read all flag values in a client component.
 */
export function useFlags(): FlagValues {
  const ctx = useContext(FlagsContext);
  if (ctx === null) {
    throw new Error("useFlags must be used within a <FlagsProvider>");
  }
  return ctx;
}
