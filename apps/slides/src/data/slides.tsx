import { flagDefinitions } from "@repo/flags";
import { BuildUsageChart } from "@/components/build-usage-chart";
import { CodeBlock, InlineCode } from "@/components/code-block";
import { DocLink } from "@/components/doc-link";
import { QaPipelineDiagram } from "@/components/qa-pipeline-diagram";

export type Category = "Flags" | "Testing" | "QA" | "Rollout" | "Build";

export type Slide = {
  slug: string;
  title: React.ReactNode;
  categories: Category[];
  content: React.ReactNode;
};

export const CATEGORY_STYLES: Record<Category, string> = {
  Flags: "text-violet-600 dark:text-violet-400",
  Testing: "text-sky-600 dark:text-sky-400",
  QA: "text-emerald-600 dark:text-emerald-400",
  Rollout: "text-amber-600 dark:text-amber-400",
  Build: "text-zinc-600 dark:text-zinc-400",
};

export const TOTAL_SLIDES = 13;

const GH =
  "https://github.com/aldosch/workshop/blob/main/packages/flags/examples";

export const slides: Slide[] = [
  {
    slug: "build-cost-what",
    title: <>Build minutes: what's happening?</>,
    categories: ["Build"],
    content: (
      <>
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-2xl font-semibold sm:text-3xl">
              $13.4k on builds this month
            </p>
            <p className="mt-3 text-lg text-muted-foreground">
              One project, <InlineCode>scribe-fe-v2-dev</InlineCode>, is{" "}
              <strong className="text-foreground">$11.3k</strong> of that alone.
            </p>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-6 py-4 text-center">
            <p className="font-mono text-3xl font-bold text-amber-600 dark:text-amber-400">
              73%
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              of $18.2k total usage
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-3">
          <p className="font-medium">Usage breakdown (Aug 1–27)</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 font-medium">Service</th>
                <th className="pb-2 text-right font-medium">Cost</th>
                <th className="pb-2 text-right font-medium">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="bg-amber-500/5">
                <td className="py-2.5 font-medium">Build CPU Minutes</td>
                <td className="py-2.5 text-right font-mono">$13,392</td>
                <td className="py-2.5 text-right font-mono text-amber-600 dark:text-amber-400">
                  73%
                </td>
              </tr>
              <tr>
                <td className="py-2.5">Fast Data Transfer</td>
                <td className="py-2.5 text-right font-mono">$2,529</td>
                <td className="py-2.5 text-right font-mono text-muted-foreground">
                  14%
                </td>
              </tr>
              <tr>
                <td className="py-2.5">Edge Requests</td>
                <td className="py-2.5 text-right font-mono">$1,435</td>
                <td className="py-2.5 text-right font-mono text-muted-foreground">
                  8%
                </td>
              </tr>
              <tr>
                <td className="py-2.5">Everything else</td>
                <td className="py-2.5 text-right font-mono">$925</td>
                <td className="py-2.5 text-right font-mono text-muted-foreground">
                  5%
                </td>
              </tr>
              <tr className="border-t-2 font-medium">
                <td className="pt-2.5">Total</td>
                <td className="pt-2.5 text-right font-mono">$18,281</td>
                <td className="pt-2.5 text-right font-mono">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <p className="mb-3 font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Monthly build CPU cost — Mar to Aug 2026
          </p>
          <BuildUsageChart />
        </div>

        <p className="mt-8 text-muted-foreground">
          Build CPU was{" "}
          <strong className="text-foreground">$0 every day</strong> from March
          through April 26. Then something changed on{" "}
          <InlineCode>2026-04-27</InlineCode>, and it's been running ~640
          MIUs/day since.
        </p>
      </>
    ),
  },
  {
    slug: "build-cost-why",
    title: <>Build minutes: why?</>,
    categories: ["Build"],
    content: (
      <>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="font-medium text-lg">12 GB heap</p>
            <p className="text-muted-foreground">
              <InlineCode>--max-old-space-size=12228</InlineCode> puts builds on
              the highest-memory tier (30 cores / 60 GB). CPU minutes are billed
              by tier, so this alone is a massive multiplier. It's baked into{" "}
              <InlineCode>scripts/build-next.ts</InlineCode> in the repo, not a
              dashboard setting.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-lg">No build cache</p>
            <p className="text-muted-foreground">
              <InlineCode>VERCEL_FORCE_NO_BUILD_CACHE</InlineCode> is set on the
              dev projects. Every build downloads 14,828 files and reinstalls
              2,719 packages from scratch. All cold, every time.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-lg">100 pushes in 2 hours</p>
            <p className="text-muted-foreground">
              29 authors merging PRs continuously, up to 6 concurrent builds at
              once. No ignored build step, so even a markdown edit triggers a
              full 12 GB, 10-minute build.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-lg">
              No <InlineCode>nx affected</InlineCode>
            </p>
            <p className="text-muted-foreground">
              The build runs <InlineCode>next build</InlineCode> directly, not{" "}
              <InlineCode>nx affected run build</InlineCode>. 34 workspace
              projects, 3,570 static pages, all compiled even when one app
              changed.
            </p>
          </div>
        </div>

        <p className="mt-8 text-muted-foreground">
          Builds run on{" "}
          <DocLink href="https://vercel.com/docs/builds/elastic-build-machines">
            Elastic Build Machines
          </DocLink>{" "}
          — Vercel's scalable build infrastructure that provisions build
          instances on demand. The 12 GB heap requests the{" "}
          <InlineCode>Turbo</InlineCode> tier (30 cores / 60 GB), which is the
          most expensive instance type. CPU minutes are billed by tier × CPU
          time consumed.
        </p>

        <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-5">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Build timeline</strong> from a
            recent production build: install ~16s · compile/bundle ~5.8 min
            (this is where the 12 GB gets consumed) · static pages ~62s ·
            sourcemaps ~207s ={" "}
            <strong className="text-foreground">~10.7 min total</strong>
          </p>
        </div>

        <p className="mt-6 text-muted-foreground">
          There are 91 projects on this team and 26+ are{" "}
          <InlineCode>scribe-fe-v2</InlineCode> variants across regions. But the
          prod/staging variants only build on merges (~36 MIUs each, 350× less).
          The dev project building on every push is the problem.
        </p>
      </>
    ),
  },
  {
    slug: "build-cost-fix",
    title: <>Build minutes: what can we do?</>,
    categories: ["Build"],
    content: (
      <>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <span className="mt-1 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              1
            </span>
            <div>
              <p className="font-medium text-lg">
                Remove <InlineCode>VERCEL_FORCE_NO_BUILD_CACHE</InlineCode>
              </p>
              <p className="text-muted-foreground">
                Safest win available. Lets dev builds use the cache, skipping
                redundant install and compilation for unchanged code. No OOM
                risk. Could cut dev build time by 50–70% on incremental pushes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="mt-1 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              2
            </span>
            <div>
              <p className="font-medium text-lg">
                Test <InlineCode>--max-old-space-size=8192</InlineCode>
              </p>
              <p className="text-muted-foreground">
                If the build completes at 8 GB, it drops to a cheaper instance
                tier (~30–40% cost reduction). No OOM errors in any recent
                failed build, so 12 GB may be historical. Try it on a preview
                deployment first.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="mt-1 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              3
            </span>
            <div>
              <p className="font-medium text-lg">Add an Ignored Build Step</p>
              <p className="text-muted-foreground">
                Skip builds for <InlineCode>*.md</InlineCode>,{" "}
                <InlineCode>*.test.*</InlineCode>,{" "}
                <InlineCode>docs/</InlineCode>,{" "}
                <InlineCode>.storybook/</InlineCode>. Would cut 20–40% of builds
                that are just non-functional changes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="mt-1 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              4
            </span>
            <div>
              <p className="font-medium text-lg">
                Switch to <InlineCode>nx affected</InlineCode>
              </p>
              <p className="text-muted-foreground">
                Only build what changed. 34 workspace projects means{" "}
                <InlineCode>nx affected run build</InlineCode> could skip most
                of the compile work when a single app or package changed.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="mt-1 font-mono text-2xl font-bold text-muted-foreground">
              5
            </span>
            <div>
              <p className="font-medium text-lg text-muted-foreground">
                Consolidate 26 regional projects, build once, configure at
                runtime
              </p>
              <p className="text-muted-foreground">
                Marcus already described where this should go: "build a single
                binary once and inject dynamic configuration at runtime." Bigger
                change, but it structurally eliminates the redundant builds.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          1–3 are quick wins you can ship in hours. 4 is medium-term. 5 is
          strategic.
        </p>
      </>
    ),
  },
  {
    slug: "build-optimisation",
    title: <>Build optimisation with Turbo</>,
    categories: ["Build"],
    content: (
      <>
        <p>
          Turborepo caches task outputs and runs independent tasks in parallel
          based on the dependency graph. This monorepo already follows the main
          best practices:
        </p>
        <ul className="mt-6 space-y-2">
          <li>
            <strong>Package tasks</strong> — each app/package has its own{" "}
            <InlineCode>build</InlineCode>, <InlineCode>lint</InlineCode>,{" "}
            <InlineCode>check-types</InlineCode> scripts
          </li>
          <li>
            <strong>Root only delegates</strong> —{" "}
            <InlineCode>turbo run build</InlineCode>, never{" "}
            <InlineCode>cd apps/x && next build</InlineCode>
          </li>
          <li>
            <strong>Outputs declared</strong> —{" "}
            <InlineCode>.next/**</InlineCode> and{" "}
            <InlineCode>dist/**</InlineCode> cached per package
          </li>
          <li>
            <strong>--affected</strong> — skip unchanged packages in CI
          </li>
        </ul>
        <CodeBlock
          language="json"
          filename="turbo.json"
          className="mt-6"
          highlightLines={[4]}
        >{`{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "check-types": {}
  }
}`}</CodeBlock>
        <p className="mt-4">
          <InlineCode>^build</InlineCode> means{" "}
          <InlineCode>@repo/flags</InlineCode> is ready before the apps build.
          Since it's a JIT package (no build step), Turbo just tracks the source
          files for cache invalidation.
        </p>
        <Docs>
          <DocLink href="https://turbo.build/docs/guides/cache">
            Turborepo caching
          </DocLink>
          <DocLink href="https://turbo.build/docs/guides/filter">
            Filtering with --affected
          </DocLink>
        </Docs>
      </>
    ),
  },
  {
    slug: "feature-flags-shared-lib",
    title: (
      <>
        Feature flags in a shared <InlineCode>@repo/flags</InlineCode> package
      </>
    ),
    categories: ["Flags"],
    content: (
      <>
        <p>
          Both apps import flags from <InlineCode>packages/flags</InlineCode>.
          Definitions use <InlineCode>as const satisfies</InlineCode>, so adding
          a flag here makes TypeScript enforce it everywhere it's consumed.
        </p>
        <CodeBlock
          language="ts"
          filename="packages/flags/src/flags.ts"
          highlightLines={[1, 8]}
        >{`export const flagDefinitions = {
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
} as const satisfies Record<string, FlagDefinition>;`}</CodeBlock>
        <p>
          Resolution order: <InlineCode>FLAGS_NEW_HOMEPAGE=true</InlineCode> env
          override, then the default value. The server evaluates and passes
          resolved booleans to the client via{" "}
          <InlineCode>&lt;FlagsProvider&gt;</InlineCode>. The client never
          touches <InlineCode>process.env</InlineCode>.
        </p>
        <Docs>
          <DocLink href="https://turbo.build/docs/guides/sharing-code">
            Sharing code in Turborepo
          </DocLink>
        </Docs>
      </>
    ),
  },
  {
    slug: "flags-using",
    title: <>Using flags in your apps</>,
    categories: ["Flags"],
    content: (
      <>
        <p>
          The server evaluates flags and passes resolved booleans to the client
          via <InlineCode>&lt;FlagsProvider&gt;</InlineCode>. Client components
          call <InlineCode>useFlag()</InlineCode> — no{" "}
          <InlineCode>process.env</InlineCode> access, no flicker.
        </p>

        <div className="grid gap-4 lg:grid-cols-2 mt-8">
          <div>
            <p className="mb-2 font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Server — evaluate once
            </p>
            <CodeBlock
              language="tsx"
              filename="app/layout.tsx"
              highlightLines={[3, 5]}
            >{`import { getFlags } from "@repo/flags";
import { FlagsProvider } from "@repo/flags/react";
// server evaluates, client never sees env
export default function Layout({ children }) {
  const flags = getFlags();
  return (
    <FlagsProvider value={flags}>
      {children}
    </FlagsProvider>
  );
}`}</CodeBlock>
          </div>
          <div>
            <p className="mb-2 font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Client — read a flag
            </p>
            <CodeBlock
              language="tsx"
              filename="components/Search.tsx"
              highlightLines={[3, 5]}
            >{`"use client";
import { useFlag } from "@repo/flags/react";
// just a boolean — no env, no flicker
export function Search() {
  const ai = useFlag("experimentalSearch");
  return ai ? <AISearch /> : <StandardSearch />;
}`}</CodeBlock>
          </div>
        </div>

        <p className="mt-6 text-muted-foreground">
          Both apps in this monorepo — slides and demo — import from the same{" "}
          <InlineCode>@repo/flags</InlineCode> package. Add a flag once, it's
          available everywhere.
        </p>

        <Docs>
          <DocLink href="https://github.com/aldosch/workshop/blob/main/apps/demo/src/app/page.tsx">
            demo app usage
          </DocLink>
          <DocLink href="https://github.com/aldosch/workshop/blob/main/packages/flags/src/react.tsx">
            FlagsProvider + useFlag source
          </DocLink>
        </Docs>
      </>
    ),
  },
  {
    slug: "flags-provider-switching",
    title: <>Switching flag providers without rewriting code</>,
    categories: ["Flags"],
    content: (
      <>
        <p>
          The Vercel Flags SDK uses an adapter pattern. You declare flags once
          and swap the provider by changing one line. Consumer code doesn't
          change.
        </p>

        <p className="mt-8 font-medium text-base sm:text-lg">
          Same flag, two providers. The highlighted line is the only difference:
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <CodeBlock
              language="ts"
              filename="launchdarkly.ts"
              highlightLines={[6]}
            >{`import { flag } from "flags/next";
import { ldAdapter } from "@flags-sdk/launchdarkly";

export const newHomepage = flag<boolean>({
  key: "new-homepage",
  identify: identifyLD,
  adapter: ldAdapter.variation(),
});`}</CodeBlock>
            <SourceLink href={`${GH}/launchdarkly.ts`} />
          </div>
          <div>
            <CodeBlock
              language="ts"
              filename="statsig.ts"
              highlightLines={[6]}
            >{`import { flag } from "flags/next";
import { statsigAdapter } from "@flags-sdk/statsig";

export const newHomepage = flag<boolean>({
  key: "new_homepage",
  identify: identifyStatsig,
  adapter: statsigAdapter.featureGate(g => g.value),
});`}</CodeBlock>
            <SourceLink href={`${GH}/statsig.ts`} />
          </div>
        </div>

        <p className="mt-8 font-medium text-base sm:text-lg">
          Consumer code stays the same regardless of provider:
        </p>
        <div className="mt-4">
          <CodeBlock
            language="tsx"
            filename="consume.tsx"
            highlightLines={[3, 5]}
          >{`import { newHomepage } from "./launchdarkly";
// or: import { newHomepage } from "./statsig";

export default async function Page() {
  const showNew = await newHomepage();
  return showNew ? <NewLayout /> : <DefaultLayout />;
}`}</CodeBlock>
          <SourceLink href={`${GH}/consume.tsx`} />
        </div>

        <p className="mt-8 text-muted-foreground">
          <InlineCode>identify()</InlineCode> resolves cookies and headers into
          a neutral <InlineCode>AppContext</InlineCode>. Each provider file maps
          it to its own context shape ( <InlineCode>LDContext</InlineCode> vs{" "}
          <InlineCode>StatsigUser</InlineCode>). That mapping and the adapter
          line are the only provider-specific code.
        </p>

        <Docs>
          <DocLink href={`${GH}/README.md`}>Examples README</DocLink>
          <DocLink href={`${GH}/identify.ts`}>identify.ts</DocLink>
          <DocLink href="https://flags-sdk.dev">Flags SDK docs</DocLink>
          <DocLink href="https://vercel.com/docs/flags/flags-explorer">
            Flags Explorer
          </DocLink>
        </Docs>
      </>
    ),
  },
  {
    slug: "visual-diff-testing",
    title: <>Visual diff testing</>,
    categories: ["Testing"],
    content: (
      <>
        <p className="mt-6">Popular options for Next.js:</p>
        <ul className="mt-3 space-y-2">
          <li>
            <strong>Playwright</strong> —{" "}
            <InlineCode>toHaveScreenshot()</InlineCode>, built in
          </li>
          <li>
            <strong>Chromatic</strong> — hosted visual review for Storybook
          </li>
          <li>
            <strong>Percy</strong> — BrowserStack, cross-browser snapshot diffs
          </li>
        </ul>
        <CodeBlock
          language="ts"
          filename="e2e/visual.spec.ts"
          className="mt-6"
          highlightLines={[5]}
        >{`import { test, expect } from "@playwright/test";

test("homepage matches baseline", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("homepage.png", {
    maxDiffPixelRatio: 0.01,
  });
});`}</CodeBlock>
        <p className="mt-4">
          Run{" "}
          <InlineCode>pnpm exec playwright test --update-snapshots</InlineCode>{" "}
          to refresh the baseline after an intentional change.
        </p>
        <Docs>
          <DocLink href="https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-screenshot">
            Playwright visual comparisons
          </DocLink>
        </Docs>
      </>
    ),
  },
  {
    slug: "journey-diff-agent-browser",
    title: <>Visual diff testing with Sandbox + agent-browser</>,
    categories: ["Testing", "QA"],
    content: (
      <>
        <p className="mt-6 font-medium">
          <DocLink href="https://github.com/vercel-labs/agent-browser">
            Why agent-browser
          </DocLink>
        </p>
        <ul className="mt-3 space-y-2">
          <li>
            <strong>Journey-level diffs</strong> — a CSS change on login that
            shifts layout on the consultation page two steps later. Page
            screenshots miss this; journey diffs catch it.
          </li>
        </ul>

        <CodeBlock
          language="bash"
          filename="journey-diff.sh"
          className="mt-6"
          highlightLines={[1, 8, 9, 10]}
        >{`agent-browser diff url \\
  https://scribe.heidihealth.com \\
  https://scribe-fe-v2-pr-123.vercel.app \\
  --journey journeys/scribe-consult.ts

# Each step returns:
#   matched: true/false
#   diff_image: visual diff (boxed regions)
#   dimension_mismatch: viewport check`}</CodeBlock>

        <p className="mt-6 text-muted-foreground">
          Built-in diff actions: <InlineCode>diff url</InlineCode>,{" "}
          <InlineCode>diff screenshot</InlineCode>,{" "}
          <InlineCode>diff snapshot</InlineCode> (DOM-level, Myers algorithm).
          Full interactivity: <InlineCode>click</InlineCode>,{" "}
          <InlineCode>fill</InlineCode>, <InlineCode>type</InlineCode>,{" "}
          <InlineCode>select</InlineCode>, <InlineCode>scroll</InlineCode>.
        </p>

        <Docs>
          <DocLink href="https://github.com/vercel-labs/agent-browser">
            vercel-labs/agent-browser
          </DocLink>
          <DocLink href="https://vercel.com/docs/sandbox">
            Vercel Sandbox
          </DocLink>
        </Docs>
      </>
    ),
  },
  {
    slug: "qa-pipeline",
    title: <>QA pipeline: checks on every PR</>,
    categories: ["QA"],
    content: (
      <>
        <p>
          A QA pipeline runs checks on every PR before merge. Turbo caches and
          parallelises them across packages.
        </p>
        <p className="mt-6">Core checks:</p>
        <ul className="mt-3 space-y-2">
          <li>
            <strong>Type checking</strong> —{" "}
            <InlineCode>tsc --noEmit</InlineCode> per package
          </li>
          <li>
            <strong>Linting</strong> — Biome, fast and unified
          </li>
          <li>
            <strong>Unit tests</strong> — Vitest or Jest, cached by Turbo
          </li>
          <li>
            <strong>E2E tests</strong> — Playwright against preview deployments
          </li>
          <li>
            <strong>Visual diff</strong> — screenshot comparison in CI
          </li>
        </ul>
        <CodeBlock
          language="yaml"
          filename=".github/workflows/ci.yml"
          className="mt-6"
          highlightLines={[11]}
        >{`name: CI
on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run lint
      - run: pnpm run check-types
      - run: pnpm run build --affected`}</CodeBlock>
        <p className="mt-4">
          <InlineCode>--affected</InlineCode> skips packages that haven't
          changed, which cuts CI time significantly.
        </p>
      </>
    ),
  },
  {
    slug: "qa-pipeline-diagram",
    title: <>Where should tests and QA agents fire?</>,
    categories: ["QA", "Testing"],
    content: (
      <>
        <p className="mb-8 text-muted-foreground">
          Every stage in a Next.js + Turborepo monorepo on Vercel where a test
          or QA agent can fire. Hover or tap a node to see the test types for
          that stage.
        </p>
        <QaPipelineDiagram />
        <Docs>
          <DocLink href="https://vercel.com/docs/fundamentals/builds">
            Vercel Builds
          </DocLink>
          <DocLink href="https://vercel.com/docs/deployments/environments">
            Environments
          </DocLink>
          <DocLink href="https://vercel.com/docs/deployment-checks">
            Deployment Checks
          </DocLink>
          <DocLink href="https://vercel.com/docs/deployments/promote-preview-to-production">
            Promote to Production
          </DocLink>
        </Docs>
      </>
    ),
  },
  {
    slug: "rollouts-region",
    title: <>Region-based rollouts</>,
    categories: ["Rollout"],
    content: (
      <>
        <p>Deploy to a specific region first, then expand.</p>
        <p className="mt-6">
          Pair this with feature flags: serve the new version to one region
          while the rest of the world gets the stable build.
        </p>
        <CodeBlock
          language="ts"
          filename="middleware.ts"
          className="mt-6"
          highlightLines={[7, 8, 9]}
        >{`import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const country = request.geo?.country || "US";

  // Only serve new version to Australia first
  if (country === "AU" && process.env.FLAGS_NEW_HOMEPAGE === "true") {
    return NextResponse.rewrite(new URL("/new-homepage", request.url));
  }

  return NextResponse.next();
}`}</CodeBlock>
        <Docs>
          <DocLink href="https://vercel.com/docs/edge-network/edge-functions">
            Vercel Edge Functions
          </DocLink>
        </Docs>
      </>
    ),
  },
  {
    slug: "rollouts-canary",
    title: <>Canary deployments with auto-rollback</>,
    categories: ["Rollout"],
    content: (
      <>
        <p>
          Canary deployments route a small percentage of traffic to the new
          version. If error rates spike, auto-rollback reverts to the previous
          deployment without anyone having to intervene.
        </p>
        <p className="mt-6">
          Vercel gives you this out of the box with{" "}
          <strong>Skew Protection</strong> and <strong>Rollbacks</strong>.
          One-click or automated revert to any prior deployment.
        </p>
        <div className="mt-8 rounded-lg border border-amber-500/20 bg-amber-500/5 p-6">
          <p className="font-medium text-sm uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Verify it worked
          </p>
          <p className="mt-3 text-muted-foreground">
            After a canary deploy, watch the <InlineCode>/overview</InlineCode>{" "}
            tab in your Vercel project. If function error rate crosses your
            threshold, hit <strong>Rollback</strong> or let the automated
            monitor handle it. The previous deployment is promoted instantly, no
            rebuild needed.
          </p>
        </div>
        <Docs>
          <DocLink href="https://vercel.com/docs/deployments/rollback">
            Vercel Rollbacks
          </DocLink>
          <DocLink href="https://vercel.com/docs/build-output-api/skew-protection">
            Skew Protection
          </DocLink>
        </Docs>
      </>
    ),
  },
];

export const slideMeta = {
  flagsCount: Object.keys(flagDefinitions).length,
};

function Docs({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1">
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
        Docs
      </span>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">{children}</div>
    </div>
  );
}

function SourceLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-1.5 inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground underline decoration-dotted underline-offset-2 transition-colors hover:text-foreground"
    >
      View on GitHub →
    </a>
  );
}
