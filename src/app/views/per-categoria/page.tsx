'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCategoryData } from '@/lib/hooks';
import { formatCurrency } from '@/lib/formatting';
import PageHeader from '@/components/PageHeader';
import TabGroup from '@/components/TabGroup';
import ChartCard from '@/components/ChartCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ANALYSIS_TABS = [
  { id: 'per-persona', label: 'Per Persona' },
  { id: 'per-categoria', label: 'Per Categoria' },
  { id: 'moglie-dividere', label: 'Moglie + Da Dividere' },
  { id: 'spese-gigi', label: 'Spese Gigi' },
];

const getCategoryColor = (index: number) => {
  if (index === 0) return '#C0392B';
  if (index <= 2) return '#F39C12';
  return '#3498DB';
};

export default function PerCategoriaPage() {
  const router = useRouter();
  const allCategories = useCategoryData();

  const handleTabChange = (tabId: string) => {
    router.push(`/views/${tabId}`);
  };

  const topCategories = useMemo(() => {
    return allCategories.slice(0, 20);
  }, [allCategories]);

  const chartData = useMemo(() => {
    return topCategories.map((cat, idx) => ({
      name: cat.categoria,
      total: Math.round(cat.total * 100) / 100,
      count: cat.count,
      fill: getCategoryColor(idx),
    }));
  }, [topCategories]);

  const tableData = useMemo(() => {
    return allCategories.map(cat => ({
      categoria: cat.categoria,
      totale: cat.total,
      conteggio: cat.count,
      media: cat.count > 0 ? cat.total / cat.count : 0,
    }));
  }, [allCategories]);

  return (
    <div style={{ padding: '0' }}>
      <PageHeader title="Analisi per Categoria" />

      <div style={{ marginBottom: '2rem' }}>
        <TabGroup
          tabs={ANALYSIS_TABS}
          activeTab="per-categoria"
          onChange={handleTabChange}
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <ChartCard title="Top 20 Categorie di Spesa" height={600}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={190} />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="total" isAnimationActive={false} fill="#3498DB" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: '15px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#1e293b',
                  }}
                >
                  Categoria
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'right',
                    fontWeight: 600,
                    color: '#1e293b',
                  }}
                >
                  Totale
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    fontWeight: 600,
                    color: '#1e293b',
                  }}
                >
                  N. Transazioni
                </th>
                <th
                  style={{
                    padding: '1rem',
                    textAlign: 'right',
                    fontWeight: 600,
                    color: '#1e293b',
                  }}
                >
                  Media
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr
                  key={row.categoria}
                  style={{
                    background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  <td style={{ padding: '1rem', color: '#1e293b', fontWeight: 500 }}>
                    {row.categoria}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: '#e74c3c', fontWeight: 600 }}>
                    {formatCurrency(row.totale)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
                    {row.conteggio}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: '#64748b' }}>
                    {formatCurrency(row.media)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
