'use client';

import { useState, useMemo } from 'react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatting';
import PageHeader from '@/components/PageHeader';

export default function SettingsPage() {
  const thresholds = useLiveQuery(() => db.alertThresholds.toArray());
  const transactions = useLiveQuery(() => db.transactions.toArray());
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLimit, setEditLimit] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  const handleAddThreshold = async () => {
    if (!newCategory || !newLimit) {
      setMessage('Seleziona categoria e importo');
      setMessageType('error');
      return;
    }

    try {
      await db.alertThresholds.add({
        categoria: newCategory,
        monthlyLimit: parseFloat(newLimit),
        isActive: true,
      });
      setNewCategory('');
      setNewLimit('');
      setMessage('Soglia aggiunta con successo');
      setMessageType('success');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(`Errore: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setMessageType('error');
    }
  };

  const handleUpdateThreshold = async (id: number) => {
    try {
      await db.alertThresholds.update(id, {
        monthlyLimit: parseFloat(editLimit),
      });
      setEditingId(null);
      setMessage('Soglia aggiornata');
      setMessageType('success');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(`Errore: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setMessageType('error');
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await db.alertThresholds.update(id, {
        isActive: !isActive,
      });
    } catch (err) {
      setMessage(`Errore: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setMessageType('error');
    }
  };

  const handleDeleteThreshold = async (id: number) => {
    try {
      await db.alertThresholds.delete(id);
      setMessage('Soglia eliminata');
      setMessageType('success');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(`Errore: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setMessageType('error');
    }
  };

  const handleExport = async () => {
    try {
      const txs = await db.transactions.toArray();
      const data = JSON.stringify(txs, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      setMessage('Dati esportati con successo');
      setMessageType('success');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(`Errore nell'esportazione: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setMessageType('error');
    }
  };

  const dbInfo = useMemo(() => {
    if (!transactions) return { count: 0, dateRange: '' };
    const count = transactions.length;
    const dates = transactions.map(t => t.data).sort();
    const dateRange = dates.length > 0 ? `${dates[0]} - ${dates[dates.length - 1]}` : '';
    return { count, dateRange };
  }, [transactions]);

  return (
    <div style={{ padding: '0' }}>
      <PageHeader title="Impostazioni" subtitle="Configura soglie alert e gestisci dati" />

      {message && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '2rem',
            borderRadius: '12px',
            background: messageType === 'success' ? '#C8E6C9' : '#FFCDD2',
            color: messageType === 'success' ? '#1B5E20' : '#B71C1C',
            border: `1px solid ${messageType === 'success' ? '#4CAF50' : '#F44336'}`,
          }}
        >
          <p style={{ fontWeight: 600, margin: 0 }}>
            {messageType === 'success' ? 'Successo' : 'Errore'}
          </p>
          <p style={{ fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>{message}</p>
        </div>
      )}

      {/* Alert Thresholds Section */}
      <div
        style={{
          background: 'white',
          borderRadius: '15px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: '0 0 0.5rem 0' }}>
          Soglie Alert Mensili
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
          Configura limiti di spesa mensili per le categorie
        </p>

        {/* Add New Threshold */}
        <div
          style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}
        >
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem', margin: 0 }}>
            Aggiungi soglia
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.875rem',
              }}
            >
              <option value="">Seleziona categoria...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Importo limite"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              style={{
                flex: 1,
                minWidth: '150px',
                padding: '0.75rem',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.875rem',
              }}
            />
            <button
              onClick={handleAddThreshold}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#5568d3')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#667eea')}
            >
              + Aggiungi
            </button>
          </div>
        </div>

        {/* Thresholds Table */}
        {thresholds && thresholds.length > 0 ? (
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
                    Categoria
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                    Limite Mensile
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#1e293b' }}>
                    Attivo
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600, color: '#1e293b' }}>
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody>
                {thresholds.map((threshold, idx) => (
                  <tr
                    key={threshold.id}
                    style={{
                      background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <td style={{ padding: '1rem', color: '#1e293b', fontWeight: 500 }}>
                      {threshold.categoria}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {editingId === threshold.id ? (
                        <input
                          type="number"
                          value={editLimit}
                          onChange={(e) => setEditLimit(e.target.value)}
                          style={{
                            border: '2px solid #667eea',
                            borderRadius: '8px',
                            padding: '6px 8px',
                            width: '160px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                          }}
                          autoFocus
                        />
                      ) : (
                        <span
                          onClick={() => {
                            setEditingId(threshold.id!);
                            setEditLimit(threshold.monthlyLimit.toString());
                          }}
                          style={{
                            color: '#667eea',
                            cursor: 'pointer',
                            fontWeight: 600,
                            textDecoration: 'underline',
                          }}
                        >
                          {formatCurrency(threshold.monthlyLimit)}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={threshold.isActive}
                        onChange={() => handleToggleActive(threshold.id!, threshold.isActive)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {editingId === threshold.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleUpdateThreshold(threshold.id!)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#27AE60',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Salva
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#cbd5e1',
                              color: '#1e293b',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Annulla
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeleteThreshold(threshold.id!)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#FCA5A5',
                            color: '#7F1D1D',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Elimina
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <p>Nessuna soglia configurata. Aggiungine una per iniziare.</p>
          </div>
        )}
      </div>

      {/* Data Management Section */}
      <div
        style={{
          background: 'white',
          borderRadius: '15px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          💾 Gestione Dati
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
          Esporta i tuoi dati in formato JSON per backup e sincronizzazione
        </p>
        <button
          onClick={handleExport}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#5568d3')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#667eea')}
        >
          📥 Esporta Transazioni (JSON)
        </button>
      </div>

      {/* Database Info Section */}
      <div
        style={{
          background: 'white',
          borderRadius: '15px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          🗄️ Informazioni Database
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: '#F0F4FF', borderRadius: '8px', border: '1px solid #E0E7FF' }}>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Totale Transazioni</p>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#667eea', margin: '0.5rem 0 0 0' }}>
              {dbInfo.count}
            </p>
          </div>
          <div style={{ padding: '1rem', background: '#F0F4FF', borderRadius: '8px', border: '1px solid #E0E7FF' }}>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Intervallo Date</p>
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', margin: '0.5rem 0 0 0' }}>
              {dbInfo.dateRange || 'Nessun dato'}
            </p>
          </div>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '1.5rem 0 0 0' }}>
          I dati sono memorizzati localmente nel browser usando IndexedDB. Non vengono sincronizzati su cloud e rimangono sempre privati.
        </p>
      </div>
    </div>
  );
}
