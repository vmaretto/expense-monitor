'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  AlertCircle,
} from 'lucide-react';

import { useStats, useMonthlyData, usePersonaData, useCategoryData, useAlerts } from '@/lib/hooks';
import { formatCurrency } from '@/lib/formatting';
import { PERSONA_COLORS } from '@/lib/constants';
import PageHeader from '@/components/PageHeader';
import MetricCard from '@/components/MetricCard';
import ChartCard from '@/components/ChartCard';

const CHART_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#ea580c', '#7c3aed', '#0891b2'];

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<[string, string] | undefined>(undefined);

  const stats = useStats(dateRange ? { dateRange } : undefined);
  const monthlyData = useMonthlyData(dateRange ? { dateRange } : undefined);
  const personaData = usePersonaData(dateRange ? { dateRange } : undefined);
  const categoryData = useCategoryData(dateRange ? { dateRange } : undefined);
  const alerts = useAlerts();

  // Transform persona data for pie chart
  const personaChartData = useMemo(
    () =>
      personaData.map(item => ({
        name: item.persona,
        value: parseFloat(item.total.toFixed(2)),
      })),
    [personaData]
  );

  // Transform category data for horizontal bar chart with color gradient
  const categoryChartData = useMemo(
    () =>
      categoryData.slice(0, 15).map((item) => ({
        categoria: item.categoria,
        total: parseFloat(item.total.toFixed(2)),
      })),
    [categoryData]
  );

  const getColorForCategory = (index: number) => {
    if (index === 0) return CHART_COLORS[1]; // red
    if (index === 1 || index === 2) return CHART_COLORS[3]; // orange
    return CHART_COLORS[0]; // blue
  };

  const handleReset = () => {
    setDateRange(undefined);
  };

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Benvenuto, visualizza il tuo riepilogo finanziario"
      />

      {/* Date Filter Bar */}
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: 'var(--shadow)',
          padding: '1.5rem',
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ flex: 1, minWidth: '180px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Data Inizio
          </label>
          <input
            type="date"
            value={dateRange?.[0] ?? ''}
            onChange={(e) => setDateRange(e.target.value ? [e.target.value, dateRange?.[1] ?? ''] : undefined)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--gray-200)',
              borderRadius: '8px',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: '180px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Data Fine
          </label>
          <input
            type="date"
            value={dateRange?.[1] ?? ''}
            onChange={(e) => setDateRange(dateRange?.[0] ? [dateRange[0], e.target.value] : undefined)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--gray-200)',
              borderRadius: '8px',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <button
          onClick={handleReset}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'white',
            border: '2px solid var(--primary)',
            color: 'var(--primary)',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--primary)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = 'var(--primary)';
          }}
        >
          Reset
        </button>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          {alerts.map((alert) => (
            <div
              key={alert.categoria}
              style={{
                background: 'white',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                color: '#991b1b',
                animation: 'fadeInUp 0.5s ease',
              }}
            >
              <AlertCircle size={24} style={{ flexShrink: 0 }} />
              <div>
                <strong>{alert.categoria}</strong> ha superato il limite mensile:
                {formatCurrency(alert.spent)} / {formatCurrency(alert.limit)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <MetricCard
          label="Entrate"
          value={formatCurrency(stats.totaleEntrate)}
          icon={<TrendingUp size={32} />}
          gradient="linear-gradient(135deg, #16a34a 0%, #059669 100%)"
          trend={{ value: 5, isPositive: true }}
        />

        <MetricCard
          label="Uscite"
          value={formatCurrency(stats.totaleUscite)}
          icon={<TrendingDown size={32} />}
          gradient="linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
          trend={{ value: 3, isPositive: false }}
        />

        <MetricCard
          label="Saldo"
          value={formatCurrency(stats.saldo)}
          icon={<Wallet size={32} />}
          gradient="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
        />

        <MetricCard
          label="Operazioni"
          value={stats.count.toString()}
          icon={<Activity size={32} />}
          gradient="linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)"
        />
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}
      >
        {/* Monthly Chart */}
        <ChartCard title="Entrate vs Uscite per Mese" height={400}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="mese" />
              <YAxis />
              <Tooltip
                formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              />
              <Legend />
              <Bar
                dataKey="entrate"
                fill="#16a34a"
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
              />
              <Bar
                dataKey="uscite"
                fill="#dc2626"
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Persona Pie Chart */}
        <ChartCard title="Chi Spende (per Persona)" height={400}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={personaChartData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={45}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={false}
                label={({ name, percent }) => `${name} (${(percent ? percent * 100 : 0).toFixed(0)}%)`}
              >
                {personaChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PERSONA_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Categories Chart */}
      <ChartCard title="Top 15 Categorie di Spesa" height={500}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={categoryChartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 350, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" />
            <YAxis dataKey="categoria" type="category" width={340} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
              contentStyle={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px',
              }}
            />
            <Bar dataKey="total" isAnimationActive={false} radius={[0, 6, 6, 0]}>
              {categoryChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColorForCategory(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
