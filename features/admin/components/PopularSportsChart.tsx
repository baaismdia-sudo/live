import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["var(--chart-indigo)", "var(--chart-violet)", "var(--chart-cyan)", "var(--chart-emerald)", "var(--chart-amber)"];

export function PopularSportsChart({ data }: { data: { sport: string; tournament_count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="tournament_count" nameKey="sport" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--color-muted)" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
