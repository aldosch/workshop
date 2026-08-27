import { flagDefinitions, getFlags } from "@repo/flags";
import {
  CircleCheck,
  CircleHelp,
  Flag,
  Rocket,
  ShieldCheck,
  SquareTerminal,
  Wrench,
} from "lucide-react";
import { CodeBlock, InlineCode } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { DocLink } from "@/components/doc-link";
import { QaPipelineDiagram } from "@/components/qa-pipeline-diagram";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Category = "Flags" | "Testing" | "QA" | "Rollout" | "Build";

type Section = {
  id: string;
  slug: string;
  title: React.ReactNode;
  categories: Category[];
  what: React.ReactNode;
  details?: React.ReactNode;
  codeExample?: React.ReactNode;
  prompt?: string;
  verify?: React.ReactNode;
};

const CATEGORY_STYLES: Record<Category, string> = {
  Flags:
    "border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-300",
  Testing: "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-300",
  QA: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  Rollout:
    "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  Build: "border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
};

const sections: Section[] = [
  {
    id: "s1",
    slug: "feature-flags-shared-lib",
    title: (
      <>
        Feature flags in a shared <InlineCode>@repo/flags</InlineCode> package
      </>
    ),
    categories: ["Flags"],
    what: (
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
        <p className="mt-2">
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
    details: (
      <>
        <p>The package exposes two entry points:</p>
        <ul className="ml-4 mt-2 list-disc space-y-1 text-sm leading-relaxed">
          <li>
            <InlineCode>@repo/flags</InlineCode> — server-only: definitions,{" "}
            <InlineCode>getFlag()</InlineCode>,{" "}
            <InlineCode>getFlags()</InlineCode>
          </li>
          <li>
            <InlineCode>@repo/flags/react</InlineCode> — client-safe:{" "}
            <InlineCode>&lt;FlagsProvider&gt;</InlineCode>,{" "}
            <InlineCode>useFlag()</InlineCode>
          </li>
        </ul>
        <p className="mt-2">
          Next.js transpiles the package in-place via{" "}
          <InlineCode>transpilePackages</InlineCode> in{" "}
          <InlineCode>next.config.ts</InlineCode> — no build step required for
          the package itself (JIT strategy).
        </p>
      </>
    ),
    codeExample: (
      <>
        <p className="mb-2">Server component evaluates and passes to client:</p>
        <CodeBlock
          language="tsx"
          filename="app/layout.tsx"
        >{`import { getFlags } from "@repo/flags";
import { FlagsProvider } from "@repo/flags/react";

export default function RootLayout({ children }) {
  const flags = getFlags(); // server-only
  return (
    <FlagsProvider value={flags}>
      {children}
    </FlagsProvider>
  );
}`}</CodeBlock>
        <p className="mt-2">Client component reads a flag:</p>
        <CodeBlock
          language="tsx"
          filename="components/Search.tsx"
        >{`"use client";
import { useFlag } from "@repo/flags/react";

export function Search() {
  const experimentalSearch = useFlag("experimentalSearch");
  return experimentalSearch ? <AISearch /> : <StandardSearch />;
}`}</CodeBlock>
      </>
    ),
  },
  {
    id: "s2",
    slug: "visual-diff-testing",
    title: <>Visual diff testing for UI regressions</>,
    categories: ["Testing"],
    what: (
      <>
        <p>
          Catch unintended UI changes before they ship. Visual regression tools
          snapshot your pages and diff them against a baseline — pixel-level
          changes that unit tests miss.
        </p>
        <p className="mt-2">Popular options for Next.js:</p>
        <ul className="ml-4 mt-2 list-disc space-y-1 text-sm leading-relaxed">
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
        <Docs>
          <DocLink href="https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-screenshot">
            Playwright visual comparisons
          </DocLink>
        </Docs>
      </>
    ),
    codeExample: (
      <>
        <CodeBlock
          language="ts"
          filename="e2e/visual.spec.ts"
        >{`import { test, expect } from "@playwright/test";

test("homepage matches baseline", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("homepage.png", {
    maxDiffPixelRatio: 0.01,
  });
});`}</CodeBlock>
        <p className="mt-2">
          Run with{" "}
          <InlineCode>pnpm exec playwright test --update-snapshots</InlineCode>{" "}
          to refresh the baseline after an intentional change.
        </p>
      </>
    ),
  },
  {
    id: "s3",
    slug: "qa-pipeline",
    title: <>QA pipeline: checks on every PR</>,
    categories: ["QA"],
    what: (
      <>
        <p>
          A robust QA pipeline runs checks on every pull request before merge.
          The monorepo structure lets Turbo cache and parallelise these across
          packages.
        </p>
        <p className="mt-2">Core checks:</p>
        <ul className="ml-4 mt-2 list-disc space-y-1 text-sm leading-relaxed">
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
      </>
    ),
    codeExample: (
      <>
        <CodeBlock
          language="yaml"
          filename=".github/workflows/ci.yml"
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
        <p className="mt-2">
          The <InlineCode>--affected</InlineCode> flag skips packages that
          haven't changed, cutting CI time dramatically.
        </p>
      </>
    ),
  },
  {
    id: "s4",
    slug: "rollouts-region",
    title: <>Region-based rollouts</>,
    categories: ["Rollout"],
    what: (
      <>
        <p>
          Deploy to specific regions first, then expand globally. Vercel's Edge
          Network lets you target by geography so you can validate in a low-risk
          market before full rollout.
        </p>
        <p className="mt-2">
          Combine with feature flags: serve the new version only to requests
          from a specific region while the rest of the world sees the stable
          version.
        </p>
        <Docs>
          <DocLink href="https://vercel.com/docs/edge-network/edge-functions">
            Vercel Edge Functions
          </DocLink>
        </Docs>
      </>
    ),
    codeExample: (
      <>
        <CodeBlock
          language="ts"
          filename="middleware.ts"
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
      </>
    ),
  },
  {
    id: "s5",
    slug: "rollouts-canary",
    title: <>Canary deployments with auto-rollback</>,
    categories: ["Rollout"],
    what: (
      <>
        <p>
          Canary deployments route a small percentage of traffic to the new
          version. If error rates spike, auto-rollback reverts to the previous
          deployment without manual intervention.
        </p>
        <p className="mt-2">
          Vercel provides this out of the box with{" "}
          <strong>Skew Protection</strong> and <strong>Rollbacks</strong> —
          one-click or automated revert to any prior deployment.
        </p>
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
    verify: (
      <>
        <p>
          After a canary deploy, monitor the <InlineCode>/overview</InlineCode>{" "}
          tab in your Vercel project. If function error rate exceeds your
          threshold, click <strong>Rollback</strong> or let the automated
          monitor revert. The previous deployment is promoted instantly — no
          rebuild required.
        </p>
      </>
    ),
  },
  {
    id: "s6",
    slug: "build-optimisation",
    title: <>Build optimisation with Turbo</>,
    categories: ["Build"],
    what: (
      <>
        <p>
          Turborepo caches task outputs and runs independent tasks in parallel
          based on the dependency graph. The monorepo is already configured with
          best practices:
        </p>
        <ul className="ml-4 mt-2 list-disc space-y-1 text-sm leading-relaxed">
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
    codeExample: (
      <>
        <CodeBlock language="json" filename="turbo.json">{`{
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
        <p className="mt-2">
          The <InlineCode>^build</InlineCode> dependency ensures{" "}
          <InlineCode>@repo/flags</InlineCode> is ready before apps build. Since
          it's a JIT package (no build step), Turbo simply tracks the source
          files for cache invalidation.
        </p>
      </>
    ),
  },
];

export default async function Page() {
  const flags = getFlags();

  return (
    <div className="slide-frame min-h-svh bg-background text-foreground">
      <main className="mx-auto px-6 py-20 sm:px-12 lg:px-20 xl:px-24 xl:py-28">
        <header className="mb-16">
          <Badge
            variant="outline"
            className="mb-6 font-mono text-[11px] tracking-wider"
          >
            WORKSHOP · CHANGE MANAGEMENT &amp; BUILD OPTIMISATION
          </Badge>
          <h1 className="text-balance font-semibold text-4xl tracking-tight sm:text-5xl xl:text-6xl">
            Heidi Health — 2026-08-27
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed sm:text-lg">
            Workshop notes covering feature flags, visual diff testing, QA
            pipelines, rollouts with auto-rollback, and build optimisation in a
            Turborepo monorepo.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Flag aria-hidden="true" className="size-3" />
              {Object.keys(flagDefinitions).length} flags defined
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Rocket aria-hidden="true" className="size-3" />2 apps
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <ShieldCheck aria-hidden="true" className="size-3" />
              pnpm + Turbo
            </Badge>
          </div>
        </header>

        <ol className="space-y-4">
          {sections.map((section, i) => (
            <li
              key={section.id}
              id={section.slug}
              className="scroll-mt-8 rounded-xl border bg-card p-6 transition-colors sm:p-8 xl:p-10"
            >
              <div className="mb-6 flex items-start gap-4">
                <h2 className="flex-1 font-medium text-lg leading-snug sm:text-xl xl:text-2xl">
                  {section.title}
                </h2>
                <div className="flex shrink-0 flex-wrap justify-end gap-1.5 self-start">
                  {section.categories.map((c) => (
                    <span
                      key={c}
                      className={cn(
                        "rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider leading-snug",
                        CATEGORY_STYLES[c],
                      )}
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <a
                  href={`#${section.slug}`}
                  className="shrink-0 self-start font-mono text-muted-foreground text-xs leading-snug tabular-nums hover:text-foreground sm:text-sm sm:leading-snug"
                  aria-label={`Link to section ${i + 1}`}
                >
                  S{i + 1}
                </a>
              </div>
              <div className="space-y-4 text-sm leading-relaxed sm:text-base">
                {section.what}
              </div>

              <Accordion multiple className="mt-6 border-t pt-2">
                {section.details && (
                  <AccordionItem
                    value={`${section.id}-details`}
                    className="border-b-0!"
                  >
                    <AccordionTrigger className="cursor-pointer py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hover:text-foreground hover:no-underline">
                      <span className="flex items-center gap-2">
                        <CircleHelp aria-hidden="true" className="size-3.5" />
                        Details
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2 text-muted-foreground text-sm leading-relaxed sm:text-base">
                        {section.details}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {section.codeExample && (
                  <AccordionItem
                    value={`${section.id}-code`}
                    className="border-b-0!"
                  >
                    <AccordionTrigger className="cursor-pointer py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hover:text-foreground hover:no-underline">
                      <span className="flex items-center gap-2">
                        <SquareTerminal
                          aria-hidden="true"
                          className="size-3.5"
                        />
                        Code
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {section.codeExample}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {section.prompt && (
                  <AccordionItem
                    value={`${section.id}-prompt`}
                    className="border-b-0!"
                  >
                    <AccordionTrigger className="cursor-pointer py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hover:text-foreground hover:no-underline">
                      <span className="flex items-center gap-2">
                        <SquareTerminal
                          aria-hidden="true"
                          className="size-3.5"
                        />
                        Prompt
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2">
                        <PromptBlock text={section.prompt} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {section.verify && (
                  <AccordionItem
                    value={`${section.id}-verify`}
                    className="border-b-0!"
                  >
                    <AccordionTrigger className="cursor-pointer py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hover:text-foreground hover:no-underline">
                      <span className="flex items-center gap-2">
                        <CircleCheck aria-hidden="true" className="size-3.5" />
                        Verify
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2 text-muted-foreground text-sm leading-relaxed sm:text-base">
                        {section.verify}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </li>
          ))}
        </ol>

        <section
          id="qa-pipeline-diagram"
          className="mt-4 scroll-mt-8 rounded-xl border bg-card p-6 sm:p-8 xl:p-10"
        >
          <div className="mb-6 flex items-start gap-4">
            <h2 className="flex-1 font-medium text-lg leading-snug sm:text-xl xl:text-2xl">
              Where should tests and QA agents fire?
            </h2>
            <span className="shrink-0 self-start rounded-md border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider leading-snug text-sky-800 dark:text-sky-300">
              Testing · QA
            </span>
            <a
              href="#qa-pipeline-diagram"
              className="shrink-0 self-start font-mono text-muted-foreground text-xs leading-snug tabular-nums hover:text-foreground sm:text-sm sm:leading-snug"
              aria-label="Link to QA pipeline diagram"
            >
              S7
            </a>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Every stage where a test or QA agent could fire in a Next.js +
            Turborepo monorepo on Vercel. Hover or tap a node to see the test
            types that belong there. Particles flow left to right through the
            pipeline — from instant code-level checks to production monitoring.
          </p>
          <QaPipelineDiagram />
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 pt-2">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Docs
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
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
            </div>
          </div>
        </section>

        {flags.betaAnalytics && (
          <section className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/5 p-6 sm:p-8">
            <h2 className="mb-3 flex items-center gap-2 font-medium text-lg sm:text-xl">
              <span
                aria-hidden="true"
                className="inline-block size-1.5 rounded-full bg-violet-500"
              />
              Bonus: betaAnalytics flag is ON
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
              This section only renders because{" "}
              <InlineCode>FLAGS_BETA_ANALYTICS=true</InlineCode> is set in the
              environment. The slides app itself uses{" "}
              <InlineCode>@repo/flags</InlineCode> — the same package the demo
              app uses. Set the env var and restart to toggle this section.
            </p>
          </section>
        )}

        <section className="mt-4 rounded-xl border bg-card p-6 sm:p-8 xl:p-10">
          <h2 className="mb-4 font-medium text-lg sm:text-xl">
            Workshop structure
          </h2>
          <CodeBlock language="text" filename="monorepo layout">{`workshop/
├── apps/
│   ├── slides/     ← this app (workshop notes)
│   └── demo/       ← minimal flags demo
├── packages/
│   ├── flags/      ← shared flag definitions + React provider
│   └── typescript-config/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json`}</CodeBlock>
        </section>

        <footer className="mt-16 flex items-center justify-between text-muted-foreground text-xs sm:text-sm">
          <span className="flex items-center gap-1.5">
            <Wrench aria-hidden="true" className="size-3" />
            workshop · pnpm + turbo + next.js
          </span>
          <time dateTime="2026-08-27">2026-08-27</time>
        </footer>
      </main>
    </div>
  );
}

function Docs({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
        Docs
      </span>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">{children}</div>
    </div>
  );
}

function PromptBlock({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const copyRevealClasses =
    "opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100";

  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-muted/40 text-card-foreground",
        className,
      )}
    >
      <CopyButton
        text={text}
        className={cn("absolute top-1.5 right-1.5 z-10", copyRevealClasses)}
      />
      <pre className="overflow-x-auto whitespace-pre-wrap px-4 py-3 pr-10 font-mono text-[13px] text-foreground leading-relaxed">
        {text}
      </pre>
    </figure>
  );
}
