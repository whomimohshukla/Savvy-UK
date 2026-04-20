'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SavingsChartProps {
  data: { category: string; _sum: { annualSaving: number } }[];
}

const COLORS: Record<string, string> = {
  benefits:  '#10B981',
  energy:    '#F59E0B',
  broadband: '#3B82F6',
  insurance: '#7C3AED',
  mobile:    '#EC4899',
  other:     '#94A3B8',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-card text-sm">
        <p className="font-bold text-slate-900 capitalize mb-0.5">{payload[0].payload.category}</p>
        <p className="text-emerald-600 font-black">
          £{Math.round(payload[0].value).toLocaleString()}/yr
        </p>
      </div>
    );
  }
  return null;
};

export function SavingsChart({ data }: SavingsChartProps) {
  if (!data?.length) return null;

  const chartData = data.map((d) => ({
    category: d.category.charAt(0).toUpperCase() + d.category.slice(1),
    value: Math.round(d._sum.annualSaving),
    raw: d.category,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `£${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={COLORS[entry.raw] || COLORS.other} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
