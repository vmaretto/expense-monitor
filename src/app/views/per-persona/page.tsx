'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePersonaData, useCategoryData, useMonthlyData } from '@/lib/hooks';
import { PERSONA_COLORS } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatting';
import PageHeader from '@/components/PageHeader';
import TabGroup from '@/components/TabGroup';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const ANALYSIS_TABS = [
  { id: 'per-persona', label: 'Per Persona' },
  { id: 'per-categoria', label: 'Per Categoria' },
  { id: 'moglie-dividere', label: 'Moglie + Da Dividere' },
  { id: 'spese-gigi', label: 'Spese Gigi' },
];

const personaIcons: Record<string, string> = {
  'Virgilio': '👨',
  'Moglie': '👩',
  'Figlio': '👦',
  'Famiglia': '👨‍👩‍👧',
  'Da Dividere': '🔄',
};

export default function PerPersonaPage() {
  const router = useRouter();
  const personaData = usePersonaData();
  const monthlyData = useMonthlyData();

  const handleTabChange = (tabId: string) => {
    router.push(`/views/${tabId}`);
  };

  // Prepare pie chart data
  const pieData = useMemo(() => {
    return personaData
      .filter(p => p.persona !== 'Entrata')
      .map(p => ({
        name: p.persona,
        value: Math.round(p.total * 100) / 100,
      }));
  }, [personaData]);

  // Prepare monthly bar chart data
  const barData = useMemo(() => {
    return monthlyData.map(month => {
      const monthData: Record<string, any> = {
        mese: month.mese,
      };

      personaData.forEach(p => {
        const personaTransactions = (window as any).__personaMonthly?.[month.mese]?.[p.persona] || 0;
        monthData[p.persona] = personaTransactions;
      });

      return monthData;
    });
  }, [monthlyData, personaData]);

  return (
    <div style={{ padding: '0' }}>
      <PageHeader title="Analisi per Persona" />

      <div style={{ marginBottom: '2rem' }}>
        <TabGroup
          tabs={ANALYSIS_TABS}
          activeTab="per-persona"
          onChange={handleTabChange}
        />
      </div>

      {/* Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {personaData
          .filter(p => p.persona !== 'Entrata')
          .map(p => {
            const color = PERSONA_COLORS[p.persona] || '#667eea';
            const gradient = `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`;
            return (
              <MetricCard
                key={p.persona}
                label={p.persona}
                value={formatCurrency(p.total)}
                icon={personaIcons[p.persona] || '💰'}
                gradient={gradient}
              />
            );
          })}
      </div>

      {/* Pie Chart */}
      <div style={{ marginBottom: '2rem' }}>
        <ChartCard title="Chi Spende (per Persona)" height={400}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PERSONA_COLORS[entry.name] || '#667eea'} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Monthly Trend Bar Chart */}
      <div>
        <ChartCard title="Trend Mensile per Persona" height={400}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData.map(m => ({
                mese: m.mese,
                ...Object.fromEntries(
                  personaData.map(p => [p.persona, 0])
                ),
              }))}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="mese" />
              <YAxis />
              {personaData
                .filter(p => p.persona !== 'Entrata')
                .map(p => (
                  <Bar
                    key={p.persona}
                    dataKey={p.persona}
                    fill={PERSONA_COLORS[p.persona] || '#667eea'}
                    isAnimationActive={false}
                  />
                ))}
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
