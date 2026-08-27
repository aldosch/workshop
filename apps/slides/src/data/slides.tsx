import { flagDefinitions } from "@repo/flags";
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

export const TOTAL_SLIDES = 8;

const GH =
  "https://github.com/aldosch/workshop/blob/main/packages/flags/examples";

export const slides: Slide[] = [
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
          All flags live in <InlineCode>packages/flags</InlineCode> — a single
          source of truth that both apps import. Definitions are type-safe via{" "}
          <InlineCode>as const satisfies</InlineCode>, so adding a flag here
          makes TypeScript enforce it everywhere.
        </p>
        <CodeBlock
          language="ts"
          filename="packages/flags/src/flags.ts"
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
          Resolution order: environment variable override (
          <InlineCode>FLAGS_NEW_HOMEPAGE=true</InlineCode>) then default value.
          The server evaluates flags and passes resolved booleans to the client
          via <InlineCode>&lt;FlagsProvider&gt;</InlineCode> — the client never
          sees <InlineCode>process.env</InlineCode>.
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
    slug: "flags-provider-switching",
    title: <>Switching flag providers without rewriting code</>,
    categories: ["Flags"],
    content: (
      <>
        <p>
          The Vercel Flags SDK uses an adapter pattern. You declare flags once
          and swap the underlying provider (LaunchDarkly, Statsig, native
          Vercel) by changing one line — the <InlineCode>adapter</InlineCode>{" "}
          field. Consumer code never changes.
        </p>

        <p className="mt-8 font-medium text-base sm:text-lg">
          Same flag, two providers — only the adapter line differs:
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <CodeBlock
              language="ts"
              filename="launchdarkly.ts"
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
          >{`import { newHomepage } from "./launchdarkly";
// or: import { newHomepage } from "./statsig";

export default async function Page() {
  const showNew = await newHomepage();
  return showNew ? <NewLayout /> : <DefaultLayout />;
}`}</CodeBlock>
          <SourceLink href={`${GH}/consume.tsx`} />
        </div>

        <p className="mt-8 text-muted-foreground">
          The <InlineCode>identify()</InlineCode> function resolves cookies and
          headers into a neutral <InlineCode>AppContext</InlineCode>. Each
          provider file maps it to its own context shape (
          <InlineCode>LDContext</InlineCode> vs{" "}
          <InlineCode>StatsigUser</InlineCode>). That mapping is the only other
          provider-specific code.
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
    title: <>Visual diff testing for UI regressions</>,
    categories: ["Testing"],
    content: (
      <>
        <p>
          Catch unintended UI changes before they ship. Visual regression tools
          snapshot your pages and diff them against a baseline — pixel-level
          changes that unit tests miss.
        </p>
        <p className="mt-6">Popular options for Next.js:</p>
        <ul className="mt-3 space-y-2">
          <li>
            <strong>Playwright</strong> + screenshot comparison — built-in,{" "}
            <InlineCode>toHaveScreenshot()</InlineCode>
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
        >{`import { test, expect } from "@playwright/test";

test("homepage matches baseline", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("homepage.png", {
    maxDiffPixelRatio: 0.01,
  });
});`}</CodeBlock>
        <p className="mt-4">
          Run with{" "}
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
    slug: "qa-pipeline",
    title: <>QA pipeline: checks on every PR</>,
    categories: ["QA"],
    content: (
      <>
        <p>
          A robust QA pipeline runs checks on every pull request before merge.
          The monorepo structure lets Turbo cache and parallelise these across
          packages.
        </p>
        <p className="mt-6">Core checks:</p>
        <ul className="mt-3 space-y-2">
          <li>
            <strong>Type checking</strong> —{" "}
            <InlineCode>tsc --noEmit</InlineCode> per package
          </li>
          <li>
            <strong>Linting</strong> — Biome for fast, unified formatting and
            linting
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
          The <InlineCode>--affected</InlineCode> flag skips packages that
          haven't changed, cutting CI time dramatically.
        </p>
      </>
    ),
  },
  {
    slug: "rollouts-region",
    title: <>Region-based rollouts</>,
    categories: ["Rollout"],
    content: (
      <>
        <p>
          Deploy to specific regions first, then expand globally. Vercel's Edge
          Network lets you target by geography so you can validate in a low-risk
          market before full rollout.
        </p>
        <p className="mt-6">
          Combine with feature flags: serve the new version only to requests
          from a specific region while the rest of the world sees the stable
          version.
        </p>
        <CodeBlock
          language="ts"
          filename="middleware.ts"
          className="mt-6"
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
          deployment without manual intervention.
        </p>
        <p className="mt-6">
          Vercel provides this out of the box with{" "}
          <strong>Skew Protection</strong> and <strong>Rollbacks</strong> —
          one-click or automated revert to any prior deployment.
        </p>
        <div className="mt-8 rounded-lg border border-amber-500/20 bg-amber-500/5 p-6">
          <p className="font-medium text-sm uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Verify it worked
          </p>
          <p className="mt-3 text-muted-foreground">
            After a canary deploy, monitor the{" "}
            <InlineCode>/overview</InlineCode> tab in your Vercel project. If
            function error rate exceeds your threshold, click{" "}
            <strong>Rollback</strong> or let the automated monitor revert. The
            previous deployment is promoted instantly — no rebuild required.
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
  {
    slug: "build-optimisation",
    title: <>Build optimisation with Turbo</>,
    categories: ["Build"],
    content: (
      <>
        <p>
          Turborepo caches task outputs and runs independent tasks in parallel
          based on the dependency graph. The monorepo is already configured with
          best practices:
        </p>
        <ul className="mt-6 space-y-2">
          <li>
            <strong>Package tasks</strong> — each app/package defines its own{" "}
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
        <CodeBlock language="json" filename="turbo.json" className="mt-6">{`{
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
          The <InlineCode>^build</InlineCode> dependency ensures{" "}
          <InlineCode>@repo/flags</InlineCode> is ready before apps build. Since
          it's a JIT package (no build step), Turbo simply tracks the source
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
    slug: "qa-pipeline-diagram",
    title: <>Where should tests and QA agents fire?</>,
    categories: ["QA", "Testing"],
    content: (
      <>
        <p className="mb-8 text-muted-foreground">
          Every stage where a test or QA agent could fire in a Next.js +
          Turborepo monorepo on Vercel. Hover or tap a node to see the test
          types that belong there.
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
