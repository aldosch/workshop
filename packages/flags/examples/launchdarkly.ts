/**
 * LaunchDarkly integration via the Flags SDK adapter.
 *
 * This file mirrors the 3 flags in `src/flags.ts` but evaluates them through
 * LaunchDarkly instead of environment variables. Consumer code is identical
 * regardless of provider — `await newHomepage()` works the same here as with
 * the Statsig version.
 *
 * Requires:
 *   pnpm add flags @flags-sdk/launchdarkly
 *
 * Env vars (see README.md):
 *   LAUNCHDARKLY_CLIENT_SIDE_ID
 *   LAUNCHDARKLY_PROJECT_SLUG
 *   EXPERIMENTATION_CONFIG  (Global Config connection string)
 */
import { flag } from "flags/next";
import { ldAdapter, type LDContext } from "@flags-sdk/launchdarkly";
import { identify, type AppContext } from "./identify";

/**
 * Map the neutral AppContext to a LaunchDarkly Evaluation Context.
 *
 * LD contexts use `{ key, kind, ... }`. `kind` is typically "user" but can
 * be "team", "org", etc. for multi-context evaluation.
 *
 * Docs: https://launchdarkly.com/docs/home/observability/contexts
 */
function toLDContext(ctx: AppContext): LDContext {
  if (ctx.userId) {
    return {
      key: ctx.userId,
      kind: "user",
      plan: ctx.plan,
      region: ctx.region ?? undefined,
    };
  }
  // Anonymous context — LD supports evaluation without a known user
  return {
    key: "anonymous",
    kind: "user",
    anonymous: true,
  };
}

/**
 * Wrap the shared identify with the LD context mapping.
 * `dedupe` is already applied in identify(), so this stays cheap.
 */
const identifyLD = async (): Promise<LDContext> => toLDContext(await identify());

/**
 * Flag declarations — same keys as src/flags.ts, now evaluated by LaunchDarkly.
 *
 * The `key` must match the flag name in your LaunchDarkly project.
 * `ldAdapter.variation()` calls LD's variation API and returns a boolean.
 */
export const newHomepage = flag<boolean, LDContext>({
  key: "new-homepage",
  identify: identifyLD,
  adapter: ldAdapter.variation(),
});

export const betaAnalytics = flag<boolean, LDContext>({
  key: "beta-analytics",
  identify: identifyLD,
  adapter: ldAdapter.variation(),
});

export const experimentalSearch = flag<boolean, LDContext>({
  key: "experimental-search",
  identify: identifyLD,
  adapter: ldAdapter.variation(),
});

/**
 * Bulk evaluation — equivalent to getFlags() in the current package.
 * The Flags SDK resolves all flags sharing the same adapter in one
 * provider call when possible (bulkDecide).
 */
export async function getFlagsLD(): Promise<{
  newHomepage: boolean;
  betaAnalytics: boolean;
  experimentalSearch: boolean;
}> {
  const [newHomepageVal, betaAnalyticsVal, experimentalSearchVal] =
    await Promise.all([newHomepage(), betaAnalytics(), experimentalSearch()]);

  return {
    newHomepage: newHomepageVal,
    betaAnalytics: betaAnalyticsVal,
    experimentalSearch: experimentalSearchVal,
  };
}
