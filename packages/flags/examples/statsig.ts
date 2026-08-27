/**
 * Statsig integration via the Flags SDK adapter.
 *
 * Same 3 flags as `src/flags.ts` and `launchdarkly.ts`, evaluated through
 * Statsig. Consumer code is identical — `await newHomepage()` works the
 * same regardless of provider.
 *
 * Statsig calls boolean flags "Feature Gates". The adapter also supports
 * Dynamic Configs, Experiments, Autotune, and Layers — see:
 *   https://flags-sdk.dev/docs/providers/statsig
 *
 * Requires:
 *   pnpm add flags @flags-sdk/statsig
 *
 * Env vars (see README.md):
 *   STATSIG_SERVER_API_KEY
 *   EXPERIMENTATION_CONFIG  (optional, for Global Config)
 *   EXPERIMENTATION_CONFIG_ITEM_KEY  (optional)
 */
import { flag } from "flags/next";
import { statsigAdapter, type StatsigUser } from "@flags-sdk/statsig";
import { identify, type AppContext } from "./identify";

/**
 * Map the neutral AppContext to a Statsig User.
 *
 * Statsig users use `userID` (camelCase) and a `custom` map for attributes.
 *
 * Docs: https://docs.statsig.com/concepts/user
 */
function toStatsigUser(ctx: AppContext): StatsigUser {
  return {
    userID: ctx.userId ?? "anonymous",
    custom: {
      teamId: ctx.teamId ?? undefined,
      plan: ctx.plan,
      region: ctx.region ?? undefined,
    },
  };
}

const identifyStatsig = async (): Promise<StatsigUser> =>
  toStatsigUser(await identify());

/**
 * Flag declarations — keys must match the Feature Gate names in Statsig console.
 *
 * `statsigAdapter.featureGate((gate) => gate.value)` evaluates a Feature Gate
 * and extracts the boolean value. For experiments or dynamic configs, use
 * `statsigAdapter.experiment()` or `statsigAdapter.dynamicConfig()` instead.
 */
export const newHomepage = flag<boolean, StatsigUser>({
  key: "new_homepage",
  identify: identifyStatsig,
  adapter: statsigAdapter.featureGate((gate) => gate.value),
});

export const betaAnalytics = flag<boolean, StatsigUser>({
  key: "beta_analytics",
  identify: identifyStatsig,
  adapter: statsigAdapter.featureGate((gate) => gate.value),
});

export const experimentalSearch = flag<boolean, StatsigUser>({
  key: "experimental_search",
  identify: identifyStatsig,
  adapter: statsigAdapter.featureGate((gate) => gate.value),
});

/**
 * Bulk evaluation — same shape as getFlagsLD() and the original getFlags().
 */
export async function getFlagsStatsig(): Promise<{
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

/**
 * Optional: enable exposure logging for experimentation.
 *
 * By default, middleware/server-component evaluations don't log exposures
 * (because routes may be prefetched). Enable per-flag when running A/B tests:
 *
 *   adapter: statsigAdapter.featureGate(
 *     (gate) => gate.value,
 *     { exposureLogging: true }
 *   )
 *
 * Then call `Statsig.flush()` at an appropriate point in your request lifecycle.
 */
