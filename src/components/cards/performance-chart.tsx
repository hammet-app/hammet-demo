"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";
import type { PerformancePoint } from "@/lib/api/performance";

const BAND_THRESHOLDS = { needsWork: 0.4, improving: 0.75 };

const BAND_COLORS = {
  "Needs Work": { fill: "#FEF3C7", stroke: "#F59E0B", text: "#92400E" },
  Improving:    { fill: "#EDE9FE", stroke: "#7C3AED", text: "#4C1D95" },
  Strong:       { fill: "#D1FAE5", stroke: "#10B981", text: "#065F46" },
};

function buildTick(point: PerformancePoint, isMultiTerm: boolean): string {
  return isMultiTerm ? `T${point.term}W${point.label}` : `W${point.label}`;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as PerformancePoint & { tick: string };
  const colors = BAND_COLORS[point.band];

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 12,
      fontFamily: "var(--font-sans)",
    }}>
      <p style={{ color: "#6B7280", marginBottom: 4 }}>{point.tick}</p>
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontWeight: 600,
        color: colors.text,
        background: colors.fill,
        padding: "2px 8px",
        borderRadius: 20,
      }}>
        <span style={{
          width: 6, height: 6,
          borderRadius: "50%",
          background: colors.stroke,
          display: "inline-block",
        }} />
        {point.band}
      </span>
    </div>
  );
}

function CustomDot(props: any) {
  const { cx, cy, index, dataLength } = props;
  if (index !== dataLength - 1) return null;
  return (
    <circle cx={cx} cy={cy} r={6} fill="#06B6D4" stroke="#fff" strokeWidth={2} />
  );
}

interface PerformanceChartProps {
  data: PerformancePoint[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  if (!data.length) return null;

  const isMultiTerm = new Set(data.map((d) => d.term)).size > 1;
  const chartData = data.map((p) => ({ ...p, tick: buildTick(p, isMultiTerm) }));
  const lastPoint = chartData[chartData.length - 1];
  const lastColors = BAND_COLORS[lastPoint.band];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 72, left: 0, bottom: 8 }}
        >
          <defs>
            <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#06B6D4" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* Band background zones */}
          <ReferenceArea y1={0}    y2={0.4}  fill="#FEF3C7" fillOpacity={0.35} ifOverflow="hidden" />
          <ReferenceArea y1={0.4}  y2={0.75} fill="#EDE9FE" fillOpacity={0.28} ifOverflow="hidden" />
          <ReferenceArea y1={0.75} y2={1}    fill="#D1FAE5" fillOpacity={0.28} ifOverflow="hidden" />

          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />

          {/* Band threshold lines */}
          <ReferenceLine y={BAND_THRESHOLDS.needsWork} stroke="#F59E0B" strokeDasharray="4 4" strokeOpacity={0.5} />
          <ReferenceLine y={BAND_THRESHOLDS.improving} stroke="#10B981" strokeDasharray="4 4" strokeOpacity={0.5} />

          <XAxis
            dataKey="tick"
            tick={{ fontSize: 11, fill: "#A1A1AA", fontFamily: "var(--font-sans)" }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis domain={[0, 1]} hide />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="y"
            stroke="#06B6D4"
            strokeWidth={2.5}
            fill="url(#perfGradient)"
            dot={(props: any) => (
              <CustomDot {...props} dataLength={chartData.length} />
            )}
            activeDot={{ r: 5, fill: "#06B6D4", stroke: "#fff", strokeWidth: 2 }}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Floating band label — top right, shows current band */}
      <div
        className="absolute top-4 right-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
        style={{
          background: lastColors.fill,
          color: lastColors.text,
          border: `1px solid ${lastColors.stroke}40`,
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: lastColors.stroke }}
        />
        {lastPoint.band}
      </div>

      {/* Legend + note */}
      <div className="flex items-center gap-4 mt-4 flex-wrap">
        {(["Needs Work", "Improving", "Strong"] as const).map((band) => {
          const c = BAND_COLORS[band];
          return (
            <div key={band} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.stroke }} />
              <span className="text-[12px] text-text-muted">{band}</span>
            </div>
          );
        })}
        <span className="text-[11px] text-text-muted ml-auto italic">
          3-week rolling average
        </span>
      </div>
    </div>
  );
}
