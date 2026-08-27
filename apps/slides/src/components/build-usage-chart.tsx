"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const data = [
  { month: "Mar", mius: 0, cost: 0 },
  { month: "Apr", mius: 2181, cost: 1963 },
  { month: "May", mius: 10500, cost: 9450 },
  { month: "Jun", mius: 13300, cost: 11970 },
  { month: "Jul", mius: 12800, cost: 11520 },
  { month: "Aug", mius: 14880, cost: 13392 },
];

const config = {
  cost: {
    label: "Build CPU cost",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

export function BuildUsageChart() {
  return (
    <ChartContainer config={config} className="h-[200px] w-full">
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-cost)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-cost)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              formatter={(value) => (
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-muted-foreground">Build CPU cost</span>
                  <span className="font-mono font-medium tabular-nums">
                    ${Number(value).toLocaleString()}/mo
                  </span>
                </div>
              )}
            />
          }
        />
        <Area
          dataKey="cost"
          type="monotone"
          stroke="var(--color-cost)"
          strokeWidth={2}
          fill="url(#fillCost)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
