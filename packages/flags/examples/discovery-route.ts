/**
 * Flags Explorer discovery endpoint.
 *
 * This route exposes flag metadata at /.well-known/vercel/flags so the Vercel
 * Toolbar's Flags Explorer can display and override your flags during local
 * dev and on preview deployments — regardless of which provider you use.
 *
 * Place this file at:
 *   app/.well-known/vercel/flags/route.ts
 *
 * The `FLAGS_SECRET` env var (32 random bytes, base64-encoded) authenticates
 * the Explorer. Generate one with:
 *   openssl rand -base64 32
 *
 * Choose ONE of the two provider sections below based on your adapter.
 */

// ── Shared imports ──────────────────────────────────────────────
import {
  createFlagsDiscoveryEndpoint,
  getProviderData,
} from "flags/next";
import { mergeProviderData } from "flags";
// Import the flag declarations from your provider file
// (launchdarkly.ts or statsig.ts — not both at the same time)
import * as flags from "../../../flags";

// ── LaunchDarkly ────────────────────────────────────────────────
// Uncomment if using @flags-sdk/launchdarkly
//
// import { getProviderData as getLaunchDarklyProviderData } from "@flags-sdk/launchdarkly";
//
// export const GET = createFlagsDiscoveryEndpoint(async () => {
//   return mergeProviderData([
//     getProviderData(flags),
//     getLaunchDarklyProviderData({
//       apiKey: process.env.LAUNCHDARKLY_API_KEY,
//       projectKey: process.env.LAUNCHDARKLY_PROJECT_KEY,
//       environment: process.env.LAUNCHDARKLY_ENVIRONMENT,
//     }),
//   ]);
// });

// ── Statsig ─────────────────────────────────────────────────────
// Uncomment if using @flags-sdk/statsig
//
// import { getProviderData as getStatsigProviderData } from "@flags-sdk/statsig";
//
// export const GET = createFlagsDiscoveryEndpoint(async () => {
//   return mergeProviderData([
//     getProviderData(flags),
//     getStatsigProviderData({
//       consoleApiKey: process.env.STATSIG_CONSOLE_API_KEY,
//       projectId: process.env.STATSIG_PROJECT_ID,
//     }),
//   ]);
// });

// ── Vercel Flags (native, no third-party provider) ──────────────
// If you're using Vercel's native flags provider instead:
//
// import { getProviderData as getVercelProviderData } from "@flags-sdk/vercel";
//
// export const GET = createFlagsDiscoveryEndpoint(async () =>
//   getVercelProviderData(flags),
// );

// `mergeProviderData` combines locally-declared flag metadata (from your
// flags.ts) with provider-managed metadata (from the LD/Statsig console).
// This lets the Explorer show both code-defined and console-defined flags.
