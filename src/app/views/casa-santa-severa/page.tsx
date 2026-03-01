'use client';

import { useState, useMemo } from 'react';
import { useTransactions, useUpdateTransaction } from '@/lib/hooks';
import { formatCurrency } from '@/lib/formatting';
import PageHeader from '@/components/PageHeader';
import MetricCard from '@/components/MetricCard';

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00Z');
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function CasaSantaSeveraPage() {
  const [editingCell, setEditingCell] = useState<{ rowId: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const allTransactions = useTransactions();
  const transactions = useMemo(
    () => allTransactions.filter(tx => tx.macroCategoria === 'Casa Santa Severa'),
    [allTransactions]
  );

  const updateTransaction = useUpdateTransaction();

  const totaleSpese = useMemo(() => {
    return transactions
      .filter((tx) => tx.importo < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.importo), 0);
  }, [transactions]);

  return (
    <div style={{ padding: '0' }}>
      <PageHeader title="Casa Santa Severa" subtitle="Spese per la casa al mare" />

      {/* Summary Card */}
      <div style={{ marginBottom: '2rem' }}>
        <MetricCard
          label="Totale Casa Santa Severa"
          value={formatCurrency(totaleSpese)}
          icon="🏠"
          gradient="linear-gradient(135deg, #F39C12 0%, #F39C12dd 100%)"
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
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  style={{
                    background: '#FFF3E0',
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
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        background: '#E0E0E0',
                        color: '#424242',
                      }}
                    >
                      {tx.persona}
                    </span>
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
