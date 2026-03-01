'use client';

import { useState, useMemo } from 'react';
import { useTransactions, useUpdateTransaction } from '@/lib/hooks';
import { CATEGORIES, PERSONAS, FONTI, PERSONA_COLORS } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/formatting';
import type { Transaction } from '@/lib/db';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Edit3, Check } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function TransactionsPage() {
  const [searchText, setSearchText] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedFonte, setSelectedFonte] = useState('');
  const [sortField, setSortField] = useState<string>('data');
  const [sortDesc, setSortDesc] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [editingCell, setEditingCell] = useState<{ rowId: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const transactions = useTransactions({
    searchText: searchText || undefined,
    persona: selectedPersona || undefined,
    categoria: selectedCategoria || undefined,
    fonte: selectedFonte || undefined,
  });
  const updateTransaction = useUpdateTransaction();

  const sortedTransactions = useMemo(() => {
    let sorted = [...transactions];
    sorted.sort((a, b) => {
      const aVal = a[sortField as keyof Transaction];
      const bVal = b[sortField as keyof Transaction];
      if (aVal == null || bVal == null) return 0;
      if (aVal < bVal) return sortDesc ? 1 : -1;
      if (aVal > bVal) return sortDesc ? -1 : 1;
      return 0;
    });
    return sorted;
  }, [transactions, sortField, sortDesc]);

  const paginatedTransactions = useMemo(() => {
    const start = pageIndex * 50;
    return sortedTransactions.slice(start, start + 50);
  }, [sortedTransactions, pageIndex]);

  const pageCount = Math.ceil(sortedTransactions.length / 50);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  };

  const handleSaveEdit = async (id: number, field: string, value: string) => {
    await updateTransaction(id, { [field]: value });
    setEditingCell(null);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDesc ? <ChevronDown size={14} /> : <ChevronUp size={14} />;
  };

  return (
    <div>
      <PageHeader
        title="Transazioni"
        subtitle="Tutte le transazioni registrate"
      />

      {/* Filter Bar */}
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: '#64748b',
            }}
          >
            Cerca
          </label>
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Cerca descrizione..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPageIndex(0);
              }}
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingRight: '14px',
                paddingTop: '10px',
                paddingBottom: '10px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.9rem',
                transition: 'border-color 0.3s ease',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#667eea')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '180px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: '#64748b',
            }}
          >
            Persona
          </label>
          <select
            value={selectedPersona}
            onChange={(e) => {
              setSelectedPersona(e.target.value);
              setPageIndex(0);
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              transition: 'border-color 0.3s ease',
              outline: 'none',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#667eea')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
          >
            <option value="">Tutte le persone</option>
            {PERSONAS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '180px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: '#64748b',
            }}
          >
            Categoria
          </label>
          <select
            value={selectedCategoria}
            onChange={(e) => {
              setSelectedCategoria(e.target.value);
              setPageIndex(0);
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              transition: 'border-color 0.3s ease',
              outline: 'none',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#667eea')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
          >
            <option value="">Tutte le categorie</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '180px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: '#64748b',
            }}
          >
            Fonte
          </label>
          <select
            value={selectedFonte}
            onChange={(e) => {
              setSelectedFonte(e.target.value);
              setPageIndex(0);
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              transition: 'border-color 0.3s ease',
              outline: 'none',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#667eea')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
          >
            <option value="">Tutti i conti</option>
            {FONTI.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Count */}
      <div
        style={{
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          color: '#64748b',
          fontWeight: 500,
        }}
      >
        {sortedTransactions.length} transazioni trovate
      </div>

      {/* Table */}
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          marginBottom: '2rem',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #e2e8f0',
                }}
              >
                {['Data', 'Descrizione', 'Categoria', 'Persona', 'Importo', 'Fonte', 'Note', 'Azioni'].map((header) => (
                  <th
                    key={header}
                    onClick={() => {
                      if (header === 'Azioni') return;
                      const fieldMap: Record<string, string> = {
                        Data: 'data',
                        Descrizione: 'descrizione',
                        Categoria: 'macroCategoria',
                        Persona: 'persona',
                        Importo: 'importo',
                        Fonte: 'fonte',
                        Note: 'note',
                      };
                      handleSort(fieldMap[header]);
                    }}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                      cursor: header !== 'Azioni' ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {header}
                      {header !== 'Azioni' && <SortIcon field={header === 'Data' ? 'data' : header === 'Descrizione' ? 'descrizione' : header === 'Categoria' ? 'macroCategoria' : header === 'Persona' ? 'persona' : header === 'Importo' ? 'importo' : header === 'Fonte' ? 'fonte' : 'note'} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((tx, idx) => (
                <tr
                  key={tx.id}
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#f8f9fa' : 'white',
                    borderBottom: '1px solid #e2e8f0',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#f8f9fa' : 'white';
                  }}
                >
                  <td
                    style={{
                      padding: '12px 16px',
                      color: '#1e293b',
                      fontWeight: 500,
                    }}
                  >
                    {formatDate(tx.data)}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      color: '#1e293b',
                    }}
                  >
                    {tx.descrizione}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      color: '#1e293b',
                    }}
                  >
                    {editingCell?.rowId === tx.id && editingCell?.field === 'macroCategoria' ? (
                      <select
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSaveEdit(tx.id!, 'macroCategoria', editValue)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(tx.id!, 'macroCategoria', editValue);
                          } else if (e.key === 'Escape') {
                            setEditingCell(null);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '2px solid #667eea',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          outline: 'none',
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
                        style={{
                          color: '#1e293b',
                        }}
                      >
                        {tx.macroCategoria}
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                    }}
                  >
                    {editingCell?.rowId === tx.id && editingCell?.field === 'persona' ? (
                      <select
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSaveEdit(tx.id!, 'persona', editValue)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(tx.id!, 'persona', editValue);
                          } else if (e.key === 'Escape') {
                            setEditingCell(null);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '2px solid #667eea',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      >
                        {PERSONAS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: PERSONA_COLORS[tx.persona] || '#94a3b8',
                          }}
                        />
                        <span style={{ color: '#1e293b' }}>{tx.persona}</span>
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      color: tx.importo < 0 ? '#dc2626' : '#16a34a',
                      fontWeight: 500,
                    }}
                  >
                    {tx.importo < 0 ? '' : '+'}
                    {formatCurrency(tx.importo)}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      color: '#64748b',
                      fontSize: '0.85rem',
                    }}
                  >
                    {tx.fonte}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      color: '#1e293b',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {editingCell?.rowId === tx.id && editingCell?.field === 'note' ? (
                      <input
                        autoFocus
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSaveEdit(tx.id!, 'note', editValue)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(tx.id!, 'note', editValue);
                          } else if (e.key === 'Escape') {
                            setEditingCell(null);
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '2px solid #667eea',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      />
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        {tx.note || '-'}
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      gap: '6px',
                    }}
                  >
                    {editingCell?.rowId === tx.id ? (
                      <button
                        onClick={() => handleSaveEdit(tx.id!, editingCell!.field, editValue)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          backgroundColor: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
                      >
                        <Check size={16} />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingCell({ rowId: tx.id!, field: 'macroCategoria' });
                            setEditValue(tx.macroCategoria);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#f1f5f9',
                            color: '#667eea',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e2e8f0';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                          }}
                          title="Modifica"
                        >
                          <Edit3 size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div
          style={{
            fontSize: '0.9rem',
            color: '#64748b',
          }}
        >
          Pagina <span style={{ fontWeight: 600, color: '#1e293b' }}>{pageCount === 0 ? 0 : pageIndex + 1}</span> di{' '}
          <span style={{ fontWeight: 600, color: '#1e293b' }}>{pageCount}</span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
          }}
        >
          <button
            onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
            disabled={pageIndex === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: pageIndex === 0 ? '#f1f5f9' : 'white',
              color: pageIndex === 0 ? '#94a3b8' : '#667eea',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: pageIndex === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              opacity: pageIndex === 0 ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (pageIndex > 0) {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = pageIndex === 0 ? '#f1f5f9' : 'white';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <ChevronLeft size={16} />
            Precedente
          </button>

          <button
            onClick={() => setPageIndex(Math.min(pageCount - 1, pageIndex + 1))}
            disabled={pageIndex >= pageCount - 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: pageIndex >= pageCount - 1 ? '#f1f5f9' : 'white',
              color: pageIndex >= pageCount - 1 ? '#94a3b8' : '#667eea',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              cursor: pageIndex >= pageCount - 1 ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              opacity: pageIndex >= pageCount - 1 ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (pageIndex < pageCount - 1) {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = pageIndex >= pageCount - 1 ? '#f1f5f9' : 'white';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            Successiva
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
