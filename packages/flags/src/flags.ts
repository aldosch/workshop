import type { FlagContext, FlagDefinition } from "./types";

/**
 * Single source of truth for all feature flags.
 *
 * Every flag lives here — both apps import from this file.
 * Add a new flag by adding a key here; TypeScript will enforce
 * that every consumer handles the new flag type-safely.
 */
export const flagDefinitions = {
  newHomepage: {
    description: "Redesigned homepage with new layout",
    defaultValue: false,
  },
  betaAnalytics: {
    description: "Beta analytics dashboard with real-time data",
    defaultValue: false,
  },
  experimentalSearch: {
    description: "AI-powered search experience",
    defaultValue: false,
  },
} as const satisfies Record<string, FlagDefinition>;

export type FlagKey = keyof typeof flagDefinitions;
export type FlagValues = Record<FlagKey, boolean>;

/**
 * Evaluate a single flag on the server.
 *
 * Resolution order:
 *   1. Environment variable override (FLAGS_<KEY>=true|false)
 *   2. Default value from the definition
 *
 * This function is server-only — it reads process.env and must
 * never be imported from a client component.
 */
export function getFlag(key: FlagKey, _context?: FlagContext): boolean {
  const def = flagDefinitions[key];
  const envKey = `FLAGS_${key.toUpperCase()}`;
  const envValue = process.env[envKey];

  if (envValue !== undefined) {
    return envValue === "true" || envValue === "1";
  }

  return def.defaultValue;
}

/**
 * Evaluate all flags at once. Use this in a server component
 * or route handler, then pass the resolved values to the client
 * via <FlagsProvider>.
 */
export function getFlags(context?: FlagContext): FlagValues {
  return Object.keys(flagDefinitions).reduce((acc, key) => {
    acc[key as FlagKey] = getFlag(key as FlagKey, context);
    return acc;
  }, {} as FlagValues);
}
