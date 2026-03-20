'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTransactions, useUpdateTransaction } from '@/lib/hooks';
import { CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatting';
import PageHeader from '@/components/PageHeader';
import TabGroup from '@/components/TabGroup';
import MetricCard from '@/components/MetricCard';

const ANALYSIS_TABS = [
  { id: 'per-persona', label: 'Per Persona' },
  { id: 'per-categoria', label: 'Per Categoria' },
  { id: 'moglie-dividere', label: 'Moglie + Da Dividere' },
  { id: 'spese-gigi', label: 'Spese Gigi' },
];

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00Z');
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function MoglieDidividere() {
  const router = useRouter();
  const [editingCell, setEditingCell] = useState<{ rowId: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const transactions = useTransactions();
  const updateTransaction = useUpdateTransaction();

  const handleTabChange = (tabId: string) => {
    router.push(`/views/${tabId}`);
  };

  const filteredTxs = useMemo(
    () => transactions.filter((tx) => tx.persona === 'Moglie' || tx.persona === 'Da Dividere'),
    [transactions]
  );

  const stats = useMemo(() => {
    const moglie = filteredTxs
      .filter((tx) => tx.persona === 'Moglie' && tx.importo < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.importo), 0);

    const dividere = filteredTxs
      .filter((tx) => tx.persona === 'Da Dividere' && tx.importo < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.importo), 0);

    return {
      moglie,
      dividere,
      metaEachone: dividere / 2,
      totalLuisa: moglie + dividere / 2,
    };
  }, [filteredTxs]);

  return (
    <div style={{ padding: '0' }}>
      <PageHeader title="Moglie + Da Dividere" />

      <div style={{ marginBottom: '2rem' }}>
        <TabGroup
          tabs={ANALYSIS_TABS}
          activeTab="moglie-dividere"
          onChange={handleTabChange}
        />
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <MetricCard
          label="Spese Moglie"
          value={formatCurrency(stats.moglie)}
          icon="👩"
          gradient="linear-gradient(135deg, #E91E63 0%, #E91E63dd 100%)"
        />
        <MetricCard
          label="Da Dividere (metà)"
          value={formatCurrency(stats.metaEachone)}
          icon="🔄"
          gradient="linear-gradient(135deg, #9B59B6 0%, #9B59B6dd 100%)"
        />
        <MetricCard
          label="Totale per Luisa"
          value={formatCurrency(stats.totalLuisa)}
          icon="💰"
          gradient="linear-gradient(135deg, #3498DB 0%, #3498DBdd 100%)"
        />
      </div>

      {/* Transactions Table */}
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
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>
                  Data
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>
                  Descrizione
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>
                  Categoria
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>
                  Persona
                </th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                  Importo
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#1e293b' }}>
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTxs.map((tx) => (
                <tr
                  key={tx.id}
                  style={{
                    background: tx.persona === 'Moglie' ? '#FCE4EC' : '#EDE7F6',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  <td style={{ padding: '1rem', color: '#1e293b', fontWeight: 500 }}>
                    {formatDate(tx.data)}
                  </td>
                  <td style={{ padding: '1rem', color: '#1e293b' }}>
                    {tx.descrizione}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {editingCell?.rowId === tx.id && editingCell?.field === 'macroCategoria' ? (
                      <select
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => {
                          updateTransaction(tx.id!, { macroCategoria: editValue });
                          setEditingCell(null);
                        }}
                        style={{
                          border: '2px solid #667eea',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        onClick={() => {
                          setEditingCell({ rowId: tx.id!, field: 'macroCategoria' });
                          setEditValue(tx.macroCategoria);
                        }}
                        style={{
                          color: '#667eea',
                          cursor: 'pointer',
                          fontWeight: 500,
                          textDecoration: 'underline',
                        }}
                      >
                        {tx.macroCategoria}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {editingCell?.rowId === tx.id && editingCell?.field === 'persona' ? (
                      <select
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => {
                          updateTransaction(tx.id!, { persona: editValue });
                          setEditingCell(null);
                        }}
                        style={{
                          border: '2px solid #667eea',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                      >
                        {['Virgilio', 'Moglie', 'Figlio', 'Famiglia', 'Da Dividere', 'Entrata'].map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        onClick={() => {
                          setEditingCell({ rowId: tx.id!, field: 'persona' });
                          setEditValue(tx.persona);
                        }}
                        style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          background: tx.persona === 'Moglie' ? '#F8BBD0' : '#D8BFD8',
                          color: tx.persona === 'Moglie' ? '#880E4F' : '#4A0E4E',
                          cursor: 'pointer',
                        }}
                      >
                        {tx.persona}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: '#e74c3c', fontWeight: 600 }}>
                    {formatCurrency(tx.importo)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {editingCell?.rowId === tx.id && editingCell?.field === 'note' ? (
                      <input
                        autoFocus
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => {
                          updateTransaction(tx.id!, { note: editValue });
                          setEditingCell(null);
                        }}
                        style={{
                          border: '2px solid #667eea',
                          borderRadius: '8px',
                          padding: '6px 8px',
                          width: '100%',
                          fontSize: '0.875rem',
                        }}
                      />
                    ) : (
                      <span
                        onClick={() => {
                          setEditingCell({ rowId: tx.id!, field: 'note' });
                          setEditValue(tx.note);
                        }}
                        style={{
                          color: '#667eea',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {tx.note || '-'}
                      </span>
                    )}
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
