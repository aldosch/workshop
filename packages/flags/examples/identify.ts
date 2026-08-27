/**
 * identify — resolve the current request to a user/team context.
 *
 * This is the provider-neutral layer. The function reads cookies and headers
 * (no network calls — keep latency low) and returns a context object.
 *
 * The RETURN TYPE is what's provider-specific:
 *   - LaunchDarkly → LDContext  ({ key, kind, ...attributes })
 *   - Statsig      → StatsigUser ({ userID, custom: { ... } })
 *
 * To keep flag declarations provider-agnostic, return a neutral shape here
 * and let each provider file map it. See `launchdarkly.ts` and `statsig.ts`
 * for how the same identify output is typed for each provider.
 */
import { dedupe } from "flags/next";
import { cookies, headers } from "next/headers";

/**
 * Neutral context — your app's canonical representation of who is requesting.
 * Provider files translate this into LDContext or StatsigUser.
 */
export interface AppContext {
  userId: string | null;
  teamId: string | null;
  plan: "free" | "pro" | "enterprise";
  region: string | null;
}

/**
 * The shared identify function. `dedupe()` ensures it runs once per request
 * even if multiple flags are evaluated — each flag calls `identify()`, but
 * the underlying function executes only the first time.
 */
export const identify = dedupe(async (): Promise<AppContext> => {
  const headerStore = await headers();
  const cookieStore = await cookies();

  const userId = cookieStore.get("userId")?.value ?? null;
  const teamId = cookieStore.get("teamId")?.value ?? null;
  const plan = (cookieStore.get("plan")?.value as AppContext["plan"]) ?? "free";
  const region = headerStore.get("x-vercel-ip-country") ?? null;

  return { userId, teamId, plan, region };
});

/**
 * Anonymous fallback — used when no user is identified.
 * Both LaunchDarkly and Statsig support anonymous evaluation.
 */
export const anonymousContext: AppContext = {
  userId: null,
  teamId: null,
  plan: "free",
  region: null,
};
