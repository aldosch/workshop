import { getFlags } from "@repo/flags";
import { Flag, Rocket, ShieldCheck } from "lucide-react";
import { InlineCode } from "@/components/code-block";
import { NavArrows, SlideNav } from "@/components/slide-nav";
import { slideMeta, TOTAL_SLIDES } from "@/data/slides";

export default function Page() {
  const flags = getFlags();

  return (
    <>
      <SlideNav current={0} total={TOTAL_SLIDES} />
      <div className="slide-canvas flex min-h-svh flex-col justify-center px-12 py-16 sm:px-20 lg:px-32 xl:px-40">
        <p className="mb-8 font-mono text-xs tracking-widest text-muted-foreground uppercase">
          WORKSHOP · CHANGE MANAGEMENT &amp; BUILD OPTIMISATION
        </p>
        <h1 className="text-balance font-semibold text-5xl tracking-tight sm:text-6xl xl:text-7xl">
          Heidi Health
        </h1>
        <p className="mt-3 font-mono text-lg text-muted-foreground sm:text-xl">
          2026-08-27
        </p>
        <p className="mt-8 max-w-2xl text-base text-muted-foreground leading-relaxed sm:text-lg xl:text-xl">
          Feature flags, visual diff testing, QA pipelines, rollouts with
          auto-rollback, and build optimisation in a Turborepo monorepo.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <span className="flex items-center gap-1.5 font-mono text-sm text-muted-foreground">
            <Flag aria-hidden="true" className="size-4" />
            {slideMeta.flagsCount} flags
          </span>
          <span className="flex items-center gap-1.5 font-mono text-sm text-muted-foreground">
            <Rocket aria-hidden="true" className="size-4" />2 apps
          </span>
          <span className="flex items-center gap-1.5 font-mono text-sm text-muted-foreground">
            <ShieldCheck aria-hidden="true" className="size-4" />
            pnpm + Turbo
          </span>
        </div>

        {flags.betaAnalytics && (
          <p className="mt-8 font-mono text-xs text-violet-500">
            betaAnalytics flag is ON —{" "}
            <InlineCode>FLAGS_BETA_ANALYTICS=true</InlineCode>
          </p>
        )}

        <p className="mt-16 font-mono text-xs text-muted-foreground/60">
          Use ← → arrow keys or the links below to navigate
        </p>
      </div>
      <NavArrows current={0} total={TOTAL_SLIDES} />
    </>
  );
}
