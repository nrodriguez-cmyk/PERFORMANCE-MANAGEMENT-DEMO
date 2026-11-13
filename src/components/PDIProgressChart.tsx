import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PdiGoal } from '../types';

interface PDIProgressChartProps {
  goals: PdiGoal[];
}

export function PDIProgressChart({ goals = [] }: PDIProgressChartProps) {
  // Aggregate goals into 70 / 20 / 10
  const categories = [
    { key: '70_experiential', label: '70% Experiencial (On-the-job)', short: '70% Experiencial', color: '#F1B400' },
    { key: '20_social', label: '20% Social (Mentoría / Coaching)', short: '20% Social', color: '#3B82F6' },
    { key: '10_formal', label: '10% Formal (Cursos / Certificaciones)', short: '10% Formal', color: '#10B981' }
  ];

  const data = categories.map(cat => {
    const catGoals = goals.filter(g => g.type === cat.key);
    const avgProgress = catGoals.length > 0
      ? Math.round(catGoals.reduce((acc, g) => acc + g.progressPercent, 0) / catGoals.length)
      : 0;

    return {
      name: cat.short,
      fullName: cat.label,
      progress: avgProgress,
      count: catGoals.length,
      color: cat.color
    };
  });

  const overallAvg = goals.length > 0
    ? Math.round(goals.reduce((acc, g) => acc + g.progressPercent, 0) / goals.length)
    : 0;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200">
        <div>
          <h4 className="text-xs font-black uppercase text-zinc-950 tracking-wider">
            Cumplimiento Global del PDI (70-20-10)
          </h4>
          <span className="text-[10px] text-zinc-500">Avance promedio de metas asignadas</span>
        </div>
        <div className="text-right">
          <span className="text-xl font-mono font-black text-zinc-950">{overallAvg}%</span>
          <span className="block text-[9px] text-zinc-400 uppercase font-mono">Consolidado</span>
        </div>
      </div>

      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: '#71717A' }} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#27272A', fontWeight: 600 }} width={115} />
            <Tooltip
              formatter={(value: any) => [`${value}% de avance`, 'Progreso']}
              labelFormatter={(label) => String(label)}
              contentStyle={{ backgroundColor: '#09090B', borderRadius: '6px', borderColor: '#F1B400', color: '#fff', fontSize: '11px' }}
            />
            <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={16}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-zinc-100 text-center">
        {data.map((d, i) => (
          <div key={i} className="p-1.5 rounded bg-zinc-50 border border-zinc-200">
            <span className="text-[9px] text-zinc-500 block truncate">{d.name}</span>
            <span className="text-xs font-mono font-bold text-zinc-900">{d.progress}%</span>
            <span className="text-[8px] text-zinc-400 block font-mono">{d.count} meta(s)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
