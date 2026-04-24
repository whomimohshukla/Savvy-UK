'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SavingsChartProps {
  data: { category: string; _sum: { annualSaving: number } }[];
}

const EMERALD_SHADES = ['#059669', '#10B981', '#34D399', '#6EE7B7', '#065f46', '#047857'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-emerald-100 bg-white p-3 shadow-sm text-sm">
        <p className="font-bold text-green-900 capitalize mb-0.5">{payload[0].payload.category}</p>
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
    value: Math.round(d._sum?.annualSaving ?? 0),
    raw: d.category,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fontSize: 12, fill: '#6ee7b7' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6ee7b7' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `£${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ecfdf5' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={EMERALD_SHADES[i % EMERALD_SHADES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
