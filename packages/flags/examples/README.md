# Integrating a flag provider (LaunchDarkly / Statsig)

These examples show how to migrate the `@repo/flags` package from its current
env-var-based evaluation to the **Vercel Flags SDK adapter pattern**.

The Flags SDK is a free, open-source abstraction layer. You declare flags once
and swap the underlying provider by changing one line — the `adapter`. Consumer
code (`await newHomepage()`) never changes when you switch providers.

## Why the adapter pattern

Heidi Health is migrating from PostHog/Flagsmith toward LaunchDarkly and may
switch again. The adapter pattern means:

- Flag declarations are provider-agnostic — only the `adapter` field is provider-specific
- Switching providers is a config change, not a code rewrite
- Flags Explorer (Vercel Toolbar) works with all providers, including overrides
- Global Config (formerly Edge Config) co-locates flag config for zero-latency reads
- Precompute works the same regardless of provider

## Files

| File | Purpose |
|---|---|
| `identify.ts` | `identify()` — resolves the request to a user/team context. Provider-neutral logic, typed to the provider's context shape. |
| `launchdarkly.ts` | Same 3 flags as `src/flags.ts`, wired with `@flags-sdk/launchdarkly` |
| `statsig.ts` | Same 3 flags, wired with `@flags-sdk/statsig` |
| `discovery-route.ts` | Flags Explorer endpoint (`/.well-known/vercel/flags`) — works with either provider |
| `consume.tsx` | Server component consumption — identical regardless of provider |

## Migration path from the current `@repo/flags`

1. **Install the Flags SDK + chosen adapter**

   ```sh
   pnpm add flags @flags-sdk/launchdarkly
   # or
   pnpm add flags @flags-sdk/statsig
   ```

2. **Add an `identify` function** (`examples/identify.ts`) — this replaces the
   unused `FlagContext` in `src/types.ts`. It reads cookies/headers to resolve
   the current user. Keep it fast: no network calls, just cookie/header parsing.

3. **Re-declare each flag** with `flag()` from `flags/next`, pointing at the
   provider's adapter (`examples/launchdarkly.ts` or `examples/statsig.ts`).
   The flag `key` must match the flag name in the provider's console.

4. **Add the discovery route** (`examples/discovery-route.ts`) so Flags Explorer
   can show and override your flags from the Vercel Toolbar.

5. **Update consumers** — replace `getFlags()` + `<FlagsProvider>` with direct
   `await flag()` calls in server components. For client components, evaluate
   server-side and pass the boolean down as a prop (same pattern as today).

6. **Set environment variables** (see below).

## Environment variables

### LaunchDarkly

```env
LAUNCHDARKLY_CLIENT_SIDE_ID=your-client-side-id
LAUNCHDARKLY_PROJECT_SLUG=your-project-slug
EXPERIMENTATION_CONFIG=your-global-config-connection-string  # from Marketplace integration
LAUNCHDARKLY_API_KEY=your-api-key          # for Flags Explorer discovery
LAUNCHDARKLY_PROJECT_KEY=your-project-key   # for Flags Explorer discovery
LAUNCHDARKLY_ENVIRONMENT=your-environment    # for Flags Explorer discovery
FLAGS_SECRET=your-32-byte-base64-secret     # secures the discovery endpoint
```

If you provision LaunchDarkly via the Vercel Marketplace, `EXPERIMENTATION_CONFIG`
is provided automatically and the adapter connects to Global Config with no
extra config.

### Statsig

```env
STATSIG_SERVER_API_KEY=your-server-api-key
STATSIG_PROJECT_ID=your-project-id           # optional, for Flags Explorer
STATSIG_CONSOLE_API_KEY=your-console-api-key  # for Flags Explorer discovery
EXPERIMENTATION_CONFIG=your-global-config-connection-string  # optional, from Marketplace
EXPERIMENTATION_CONFIG_ITEM_KEY=statsig       # optional, key in Global Config
FLAGS_SECRET=your-32-byte-base64-secret       # secures the discovery endpoint
```

## References

- [Flags SDK docs](https://flags-sdk.dev)
- [LaunchDarkly adapter](https://flags-sdk.dev/docs/providers/launchdarkly)
- [Statsig adapter](https://flags-sdk.dev/docs/providers/statsig)
- [LaunchDarkly template](https://vercel.com/templates/next.js/launchdarkly-flags-sdk)
- [Statsig template](https://vercel.com/templates/next.js/statsig-experimentation-with-flags-sdk)
- [Flags Explorer](https://vercel.com/docs/flags/flags-explorer)
