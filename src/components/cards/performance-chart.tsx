"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  ReferenceArea,
  Dot,
} from "recharts";
import type { PerformancePoint } from "@/lib/api/performance";

interface PerformanceChartProps {
  data: PerformancePoint[];
}

// Band thresholds — mirror the backend logic
const BAND_THRESHOLDS = {
  needsWork: 0.4,
  improving: 0.75,
};

const BAND_COLORS = {
  "Needs Work": { fill: "#FEF3C7", stroke: "#F59E0B", text: "#92400E" },
  Improving:    { fill: "#EDE9FE", stroke: "#7C3AED", text: "#4C1D95" },
  Strong:       { fill: "#D1FAE5", stroke: "#10B981", text: "#065F46" },
};

// Build X axis tick labels — "T1W3" format for multi-term, "W3" for single term
function buildTick(point: PerformancePoint, isMultiTerm: boolean): string {
  return isMultiTerm
    ? `T${point.term}W${point.label}`
    : `W${point.label}`;
}

// Custom dot — highlight the last point
function CustomDot(props: any) {
  const { cx, cy, index, dataLength } = props;
  if (index !== dataLength - 1) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#06B6D4" stroke="#fff" strokeWidth={2} />
    </g>
  );
}

// Custom tooltip — shows band only, no y value
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as PerformancePoint & { tick: string };
  const colors = BAND_COLORS[point.band];

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        fontFamily: "var(--font-sans)",
      }}
    >
      <p style={{ color: "#6B7280", marginBottom: 4 }}>{point.tick}</p>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontWeight: 600,
          color: colors.text,
          background: colors.fill,
          padding: "2px 8px",
          borderRadius: 20,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: colors.stroke,
            display: "inline-block",
          }}
        />
        {point.band}
      </span>
    </div>
  );
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  if (!data.length) return null;

  const terms = [...new Set(data.map((d) => d.term))];
  const isMultiTerm = terms.length > 1;

  const chartData = data.map((point) => ({
    ...point,
    tick: buildTick(point, isMultiTerm),
  }));

  const lastPoint = chartData[chartData.length - 1];
  const lastBandColors = BAND_COLORS[lastPoint.band];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={chartData}
          margin={{ top: 24, right: 80, left: 0, bottom: 8 }}
        >
          <defs>
            {/* Gradient fill for the area */}
            <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#06B6D4" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.02} />
            </linearGradient>

            {/* Band zone fills */}
            <linearGradient id="needsWorkFill" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#FEF3C7" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id="improvingFill" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#EDE9FE" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id="strongFill" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#D1FAE5" stopOpacity={0.5} />
            </linearGradient>
          </defs>

          {/* Band background zones as reference areas */}
          {/* Needs Work: 0 → 0.4 */}
          // Needs Work zone (0 → 0.4)
          <ReferenceArea y1={0} y2={0.4} fill="#FEF3C7" fillOpacity={0.35} ifOverflow="hidden" />

          // Improving zone (0.4 → 0.75)
          <ReferenceArea y1={0.4} y2={0.75} fill="#EDE9FE" fillOpacity={0.3} ifOverflow="hidden" />

          // Strong zone (0.75 → 1)
          <ReferenceArea y1={0.75} y2={1} fill="#D1FAE5" fillOpacity={0.3} ifOverflow="hidden" />

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
            vertical={false}
          />

          {/* Band threshold lines */}
          <ReferenceLine
            y={BAND_THRESHOLDS.needsWork}
            stroke="#F59E0B"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <ReferenceLine
            y={BAND_THRESHOLDS.improving}
            stroke="#10B981"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />

          <XAxis
            dataKey="tick"
            tick={{ fontSize: 11, fill: "#A1A1AA", fontFamily: "var(--font-sans)" }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />

          {/* Y axis — no numbers, just band zone labels via reference lines */}
          <YAxis
            domain={[0, 1]}
            hide
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="y"
            stroke="#06B6D4"
            strokeWidth={2.5}
            fill="url(#performanceGradient)"
            dot={(props) => (
              <CustomDot
                {...props}
                dataLength={chartData.length}
              />
            )}
            activeDot={{ r: 5, fill: "#06B6D4", stroke: "#fff", strokeWidth: 2 }}
            isAnimationActive
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Floating band label — follows the last data point */}
      <FloatingBandLabel
        band={lastPoint.band}
        colors={lastBandColors}
      />

      {/* Band legend */}
      <div className="flex items-center gap-4 mt-4 flex-wrap">
        {(["Needs Work", "Improving", "Strong"] as const).map((band) => {
          const c = BAND_COLORS[band];
          return (
            <div key={band} className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: c.stroke }}
              />
              <span className="text-[12px] text-text-muted">{band}</span>
            </div>
          );
        })}
        <span className="text-[11px] text-text-muted ml-auto">
          3-week rolling average
        </span>
      </div>
    </div>
  );
}

function FloatingBandLabel({
  band,
  colors,
}: {
  band: "Needs Work" | "Improving" | "Strong";
  colors: { fill: string; stroke: string; text: string };
}) {
  return (
    <div
      className="absolute top-5 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{
        background: colors.fill,
        color: colors.text,
        border: `1px solid ${colors.stroke}40`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: colors.stroke }}
      />
      {band}
    </div>
  );
}
