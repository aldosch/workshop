"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  CheckCheck,
  GitPullRequest,
  Hammer,
  Monitor,
  ScanSearch,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Pipeline stages — Vercel-official terminology
// ---------------------------------------------------------------------------
// Research sources:
//   https://vercel.com/docs/fundamentals/builds
//   https://vercel.com/docs/deployments/environments
//   https://vercel.com/docs/deployment-checks
//   https://vercel.com/docs/deployments/promote-preview-to-production

type ZoneId = "code" | "ci" | "deployed" | "prod";

interface Stage {
  id: string;
  zone: ZoneId;
  label: string;
  sublabel: string;
  icon: typeof Hammer;
  tests: string[];
  needsBuild: boolean;
  needsEnv: boolean;
}

const STAGES: Stage[] = [
  {
    id: "local",
    zone: "code",
    label: "Local Dev",
    sublabel: "lint · unit · secret scan",
    icon: Monitor,
    tests: ["Lint (watch)", "Unit (watch)", "Secret scan", "Focused E2E"],
    needsBuild: false,
    needsEnv: false,
  },
  {
    id: "precommit",
    zone: "code",
    label: "Pre-commit",
    sublabel: "staged lint · affected unit",
    icon: Terminal,
    tests: ["Staged lint", "Affected unit tests", "Secret scan (gitleaks)"],
    needsBuild: false,
    needsEnv: false,
  },
  {
    id: "pr-checks",
    zone: "ci",
    label: "PR Checks",
    sublabel: "lint · typecheck · unit · integration",
    icon: GitPullRequest,
    tests: [
      "Lint (all files)",
      "Typecheck (tsc)",
      "Unit (full suite)",
      "Integration tests",
    ],
    needsBuild: false,
    needsEnv: false,
  },
  {
    id: "build",
    zone: "ci",
    label: "Build",
    sublabel: "next build · Build Output",
    icon: Hammer,
    tests: [
      "TS errors fail build",
      "Prerender / ISR validation",
      "Route generation",
    ],
    needsBuild: true,
    needsEnv: false,
  },
  {
    id: "preview",
    zone: "deployed",
    label: "Preview Deployment",
    sublabel: "E2E · visual diff · smoke",
    icon: ScanSearch,
    tests: [
      "E2E (full suite)",
      "Visual regression",
      "Smoke (health, auth)",
      "API integration (real env)",
    ],
    needsBuild: true,
    needsEnv: true,
  },
  {
    id: "deploy-checks",
    zone: "deployed",
    label: "Deployment Checks",
    sublabel: "required status gate",
    icon: ShieldCheck,
    tests: [
      "Required GitHub Checks pass",
      "Lint & typecheck (native)",
      "Promotion gate",
    ],
    needsBuild: true,
    needsEnv: true,
  },
  {
    id: "post-deploy",
    zone: "prod",
    label: "Post-deployment",
    sublabel: "smoke · logs · metrics",
    icon: CheckCheck,
    tests: ["Critical-path smoke", "Log / error sampling", "Key user journey"],
    needsBuild: true,
    needsEnv: true,
  },
  {
    id: "ongoing",
    zone: "prod",
    label: "Ongoing Monitoring",
    sublabel: "synthetic · scheduled E2E",
    icon: Activity,
    tests: ["Synthetic monitoring", "Scheduled E2E", "Alerting"],
    needsBuild: true,
    needsEnv: true,
  },
];

const ZONE_META: Record<ZoneId, { label: string; color: string }> = {
  code: {
    label: "Code-level — instant, no build needed",
    color: "var(--pipe-code)",
  },
  ci: {
    label: "CI — merge gate, produces Build Output",
    color: "var(--pipe-ci)",
  },
  deployed: {
    label: "Deployed — needs running app + env vars",
    color: "var(--pipe-deployed)",
  },
  prod: {
    label: "Production — safety & monitoring",
    color: "var(--pipe-prod)",
  },
};

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------
const VB = { w: 960, h: 460 };

const NODE_W = 138;
const NODE_H = 82;
const NODE_GAP_X = 22;

const STAGE_COUNT = STAGES.length;

// Two rows: top row = stages 0-3 (code + ci), bottom row = stages 4-7 (deployed + prod)
const ROW_TOP_Y = 120;
const ROW_BOT_Y = 300;

const TOP_COUNT = 4;
const TOP_ROW_WIDTH = TOP_COUNT * NODE_W + (TOP_COUNT - 1) * NODE_GAP_X;
const TOP_X0 = (VB.w - TOP_ROW_WIDTH) / 2;
const BOT_ROW_WIDTH =
  (STAGE_COUNT - TOP_COUNT) * NODE_W +
  (STAGE_COUNT - TOP_COUNT - 1) * NODE_GAP_X;
const BOT_X0 = (VB.w - BOT_ROW_WIDTH) / 2;

interface NodePos {
  index: number;
  x: number;
  y: number;
  cx: number; // center x
  cy: number; // center y
  leftX: number; // left edge mid
  rightX: number; // right edge mid
}

const NODES: NodePos[] = STAGES.map((_, i) => {
  const isTop = i < TOP_COUNT;
  const x = isTop
    ? TOP_X0 + (i % TOP_COUNT) * (NODE_W + NODE_GAP_X)
    : BOT_X0 + (i - TOP_COUNT) * (NODE_W + NODE_GAP_X);
  const y = isTop ? ROW_TOP_Y : ROW_BOT_Y;
  return {
    index: i,
    x,
    y,
    cx: x + NODE_W / 2,
    cy: y + NODE_H / 2,
    leftX: x,
    rightX: x + NODE_W,
  };
});

// Zone boundaries — group consecutive stages by zone
interface ZoneBox {
  zone: ZoneId;
  indices: number[];
}

const ZONES: ZoneBox[] = [
  { zone: "code", indices: [0, 1] },
  { zone: "ci", indices: [2, 3] },
  { zone: "deployed", indices: [4, 5] },
  { zone: "prod", indices: [6, 7] },
];

function zoneBoxDims(indices: number[]) {
  const ns = indices.map((i) => NODES[i]);
  const minX = Math.min(...ns.map((n) => n.x));
  const maxX = Math.max(...ns.map((n) => n.x + NODE_W));
  const minY = Math.min(...ns.map((n) => n.y));
  const maxY = Math.max(...ns.map((n) => n.y + NODE_H));
  const pad = 16;
  return {
    x: minX - pad,
    y: minY - 28,
    w: maxX - minX + pad * 2,
    h: maxY - minY + 44,
  };
}

// Connection paths between consecutive stages
function stagePath(from: number, to: number): string {
  const a = NODES[from];
  const b = NODES[to];
  const sameRow = a.y === b.y;
  if (sameRow) {
    const y = a.cy;
    return `M ${a.rightX} ${y} L ${b.leftX} ${y}`;
  }
  // U-bend: go right from a, down, then left to b
  const bendX = Math.max(a.rightX, b.leftX) + NODE_GAP_X;
  return `M ${a.rightX} ${a.cy} L ${bendX} ${a.cy} L ${bendX} ${b.cy} L ${b.leftX} ${b.cy}`;
}

const CONNECTIONS: { id: string; d: string }[] = STAGES.slice(0, -1).map(
  (_, i) => ({
    id: `s${i}-s${i + 1}`,
    d: stagePath(i, i + 1),
  }),
);

// ---------------------------------------------------------------------------
// Animation: particles continuously flowing through the pipeline
// ---------------------------------------------------------------------------
interface Particle {
  id: string;
  connId: string;
  color: string;
  delay: number;
  duration: number;
}

const FLOW_INTERVAL = 1_400; // ms between particle emissions
const PARTICLE_DURATION = 1.2; // seconds per segment

function zoneColor(zone: ZoneId): string {
  return ZONE_META[zone].color;
}

export function QaPipelineDiagram() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);
  const [litConns, setLitConns] = useState<Set<string>>(new Set());
  const seqRef = useRef(0);
  const litTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // Emit particles continuously — one per FLOW_INTERVAL, cycling through connections
  useEffect(() => {
    let connIdx = 0;
    const emit = () => {
      const conn = CONNECTIONS[connIdx % CONNECTIONS.length];
      connIdx++;
      const fromStage = STAGES[connIdx - 1 < 0 ? 0 : connIdx - 1];
      const id = `p${seqRef.current++}`;
      setParticles((prev) => [
        ...prev,
        {
          id,
          connId: conn.id,
          color: zoneColor(fromStage.zone),
          delay: 0,
          duration: PARTICLE_DURATION,
        },
      ]);

      // Light up the connection briefly
      setLitConns((prev) => new Set(prev).add(conn.id));
      const key = `lit-${id}`;
      const t = setTimeout(
        () => {
          setLitConns((prev) => {
            const next = new Set(prev);
            next.delete(conn.id);
            return next;
          });
          litTimers.current.delete(key);
        },
        PARTICLE_DURATION * 1000 + 200,
      );
      litTimers.current.set(key, t);
    };

    const id = setInterval(emit, FLOW_INTERVAL);
    return () => {
      clearInterval(id);
      for (const t of litTimers.current.values()) clearTimeout(t);
      litTimers.current.clear();
    };
  }, []);

  // Clean up particles after they complete
  const removeParticle = (id: string) =>
    setParticles((prev) => prev.filter((p) => p.id !== id));

  const displayStage = hoveredStage ?? activeStage;

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border bg-muted/20">
        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="QA testing pipeline stages diagram"
        >
          {/* Zone boundaries */}
          {ZONES.map((z) => {
            const dims = zoneBoxDims(z.indices);
            const meta = ZONE_META[z.zone];
            const labelW = meta.label.length * 5.8 + 24;
            return (
              <g key={z.zone}>
                <rect
                  x={dims.x}
                  y={dims.y}
                  width={dims.w}
                  height={dims.h}
                  rx={14}
                  className="fill-foreground/[0.015] stroke-border"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
                <rect
                  x={dims.x + 12}
                  y={dims.y - 10}
                  width={labelW}
                  height={20}
                  rx={5}
                  className="fill-background stroke-border"
                  strokeWidth={1}
                />
                <text
                  x={dims.x + 12 + labelW / 2}
                  y={dims.y + 4}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize={9}
                  fontFamily="var(--font-geist-mono), monospace"
                  letterSpacing="0.08em"
                >
                  {meta.label}
                </text>
              </g>
            );
          })}

          {/* Connection lines */}
          {CONNECTIONS.map((c) => (
            <ConnectionLine key={c.id} d={c.d} lit={litConns.has(c.id)} />
          ))}

          {/* Animated particles */}
          <AnimatePresence>
            {particles.map((p) => {
              const conn = CONNECTIONS.find((c) => c.id === p.connId);
              if (!conn) return null;
              return (
                <Particle
                  key={p.id}
                  d={conn.d}
                  color={p.color}
                  delay={p.delay}
                  duration={p.duration}
                  onDone={() => removeParticle(p.id)}
                />
              );
            })}
          </AnimatePresence>

          {/* Stage nodes */}
          {STAGES.map((stage, i) => (
            <StageNodeView
              key={stage.id}
              stage={stage}
              pos={NODES[i]}
              active={displayStage === i}
              onHover={(h) => setHoveredStage(h ? i : null)}
              onClick={() => setActiveStage(activeStage === i ? null : i)}
            />
          ))}
        </svg>
      </div>

      {/* Detail panel — shows test types for the selected/hovered stage */}
      <AnimatePresence mode="wait">
        {displayStage !== null && (
          <motion.div
            key={displayStage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border bg-card p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <span
                className="inline-block size-2 rounded-full"
                style={{ background: zoneColor(STAGES[displayStage].zone) }}
              />
              <span className="font-semibold text-sm">
                {STAGES[displayStage].label}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                {STAGES[displayStage].needsBuild ? "needs build" : "instant"}
                {STAGES[displayStage].needsEnv ? " · needs env vars" : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STAGES[displayStage].tests.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-1 text-xs">
        {Object.entries(ZONE_META).map(([id, meta]) => (
          <span
            key={id}
            className="flex items-center gap-1.5 text-muted-foreground"
          >
            <span
              className="size-2 rounded-full"
              style={{ background: meta.color }}
            />
            {meta.label.split("—")[0].trim()}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ConnectionLine({ d, lit }: { d: string; lit: boolean }) {
  return (
    <motion.path
      d={d}
      fill="none"
      strokeLinecap="round"
      className={cn(!lit && "stroke-border")}
      animate={{
        strokeWidth: lit ? 2 : 1,
        opacity: lit ? 0.9 : 0.4,
      }}
      transition={{ duration: 0.25 }}
      strokeDasharray="2 7"
    />
  );
}

function Particle({
  d,
  color,
  delay,
  duration,
  onDone,
}: {
  d: string;
  color: string;
  delay: number;
  duration: number;
  onDone: () => void;
}) {
  return (
    <motion.circle
      r={4}
      style={{
        offsetPath: `path('${d}')`,
        fill: color,
        filter: `drop-shadow(0 0 5px ${color})`,
      }}
      initial={{ offsetDistance: "0%", opacity: 0 }}
      animate={{
        offsetDistance: "100%",
        opacity: [0, 1, 1, 0.9],
      }}
      transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] }}
      onAnimationComplete={onDone}
    />
  );
}

function StageNodeView({
  stage,
  pos,
  active,
  onHover,
  onClick,
}: {
  stage: Stage;
  pos: NodePos;
  active: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}) {
  const Icon = stage.icon;
  const color = zoneColor(stage.zone);

  return (
    // biome-ignore lint/a11y/useSemanticElements: SVG <g> cannot be a <button>
    <g
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
      className="cursor-pointer"
    >
      <motion.rect
        x={pos.x}
        y={pos.y}
        width={NODE_W}
        height={NODE_H}
        rx={12}
        className={cn(
          active ? "fill-foreground/[0.06]" : "fill-foreground/[0.025]",
        )}
        animate={{
          stroke: active ? color : "var(--pipe-idle)",
          strokeWidth: active ? 1.8 : 1,
          filter: active
            ? `drop-shadow(0 0 10px ${color})`
            : "drop-shadow(0 0 0px transparent)",
        }}
        transition={{ duration: 0.2 }}
      />

      {active && (
        <motion.rect
          x={pos.x - 4}
          y={pos.y - 4}
          width={NODE_W + 8}
          height={NODE_H + 8}
          rx={15}
          fill="none"
          stroke={color}
          strokeWidth={1.25}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.15, 0.5] }}
          transition={{
            duration: 1.4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          style={{
            transformOrigin: `${pos.cx}px ${pos.cy}px`,
          }}
        />
      )}

      <foreignObject x={pos.x} y={pos.y + 8} width={NODE_W} height={NODE_H}>
        <div className="flex flex-col items-center gap-0.5 px-1 text-center">
          <Icon
            className="size-4"
            style={{ color: active ? color : "var(--pipe-icon-idle)" }}
          />
          <span
            className="font-semibold text-[12px] leading-tight"
            style={{
              color: active ? "var(--pipe-label-active)" : "var(--pipe-label)",
            }}
          >
            {stage.label}
          </span>
          <span className="px-1 font-mono text-[8px] text-muted-foreground leading-tight">
            {stage.sublabel}
          </span>
        </div>
      </foreignObject>
    </g>
  );
}
