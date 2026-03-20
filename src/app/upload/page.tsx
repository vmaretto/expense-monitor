'use client';

import { useState, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';
import { db, type Transaction } from '@/lib/db';
import { FONTI } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/formatting';
import { smartParseExcel, smartParseCSV, type ParsedRow } from '@/lib/parsers';
import { useLiveQuery } from 'dexie-react-hooks';
import PageHeader from '@/components/PageHeader';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

interface ParsedTransaction {
  data?: string;
  dataStr?: string;
  descrizione?: string;
  dettaglio?: string;
  importo?: number;
  macroCategoria?: string;
  persona?: string;
  note?: string;
  fonte?: string;
  mese?: string;
}

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<Transaction[]>([]);
  const [selectedFonte, setSelectedFonte] = useState('Intesa');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [filename, setFilename] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imports = useLiveQuery(() => db.imports.toArray());

  const parseExcelFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Use smart parser to auto-detect format
          const parsedRows: ParsedRow[] = smartParseExcel(workbook, XLSX);

          const transactions: Transaction[] = parsedRows.map((row) => ({
            data: row.data,
            dataStr: new Date(row.data).toLocaleDateString('it-IT'),
            descrizione: row.descrizione,
            dettaglio: row.dettaglio,
            importo: row.importo,
            macroCategoria: 'Acquisto Vario',
            persona: 'Virgilio',
            note: '',
            fonte: selectedFonte,
            mese: row.data.substring(0, 7),
          }));

          setPreview(transactions);
          setFilename(file.name);
          setMessage(`File caricato: ${transactions.length} transazioni trovate`);
          setMessageType('info');
        } catch (err) {
          setMessage(`Errore nel parsing del file Excel: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setMessageType('error');
        }
      };
      reader.readAsBinaryString(file);
    },
    [selectedFonte]
  );

  const parseCSVFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          Papa.parse(csv, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
              // Use smart parser to auto-detect format
              const parsedRows: ParsedRow[] = smartParseCSV(results.data);

              const transactions: Transaction[] = parsedRows.map((row) => ({
                data: row.data,
                dataStr: new Date(row.data).toLocaleDateString('it-IT'),
                descrizione: row.descrizione,
                dettaglio: row.dettaglio,
                importo: row.importo,
                macroCategoria: 'Acquisto Vario',
                persona: 'Virgilio',
                note: '',
                fonte: selectedFonte,
                mese: row.data.substring(0, 7),
              }));

              setPreview(transactions);
              setFilename(file.name);
              setMessage(`File caricato: ${transactions.length} transazioni trovate`);
              setMessageType('info');
            },
            error: (error: Error) => {
              setMessage(`Errore nel parsing del file CSV: ${error.message}`);
              setMessageType('error');
            },
          });
        } catch (err) {
          setMessage(`Errore nella lettura del file: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setMessageType('error');
        }
      };
      reader.readAsText(file);
    },
    [selectedFonte]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parseExcelFile(file);
      } else if (file.name.endsWith('.csv')) {
        parseCSVFile(file);
      } else {
        setMessage('Formato file non supportato. Usa .xlsx o .csv');
        setMessageType('error');
      }
    },
    [parseExcelFile, parseCSVFile]
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      handleFile(files[0]);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const result = await db.transactions.bulkAdd(preview);
      await db.imports.add({
        filename,
        fonte: selectedFonte,
        transactionCount: preview.length,
        importedAt: new Date().toISOString(),
      });
      setMessage(`Importate ${preview.length} transazioni con successo!`);
      setMessageType('success');
      setPreview([]);
      setFilename('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`Errore nell'importazione: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImport = async (id: number) => {
    try {
      await db.imports.delete(id);
      setMessage('Importazione eliminata');
      setMessageType('success');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(`Errore nell'eliminazione: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setMessageType('error');
    }
  };

  return (
    <div>
      <PageHeader title="Upload" subtitle="Importa estratti conto da file Excel o CSV" />

      {/* Source Selector */}
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <label
          style={{
            display: 'block',
            fontSize: '0.95rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: '#1e293b',
          }}
        >
          Seleziona Fonte Bancaria
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {FONTI.map((fonte) => (
            <button
              key={fonte}
              onClick={() => setSelectedFonte(fonte)}
              style={{
                padding: '12px 16px',
                border: selectedFonte === fonte ? '2px solid #667eea' : '2px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: selectedFonte === fonte ? 'rgba(102, 126, 234, 0.05)' : 'white',
                color: selectedFonte === fonte ? '#667eea' : '#64748b',
                fontWeight: selectedFonte === fonte ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (selectedFonte !== fonte) {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFonte !== fonte) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              {fonte}
            </button>
          ))}
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `3px dashed ${dragActive ? '#667eea' : '#cbd5e1'}`,
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          backgroundColor: dragActive ? 'rgba(102, 126, 234, 0.05)' : 'white',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: '2rem',
        }}
        onMouseEnter={(e) => {
          if (!dragActive) {
            e.currentTarget.style.borderColor = '#94a3b8';
          }
        }}
        onMouseLeave={(e) => {
          if (!dragActive) {
            e.currentTarget.style.borderColor = '#cbd5e1';
          }
        }}
      >
        <Upload
          size={48}
          style={{
            margin: '0 auto 1.5rem',
            color: dragActive ? '#667eea' : '#94a3b8',
            transition: 'color 0.3s ease',
          }}
        />
        <p
          style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#1e293b',
            marginBottom: '0.5rem',
          }}
        >
          Trascina qui il file o clicca per selezionare
        </p>
        <p
          style={{
            fontSize: '0.9rem',
            color: '#64748b',
            marginBottom: '1rem',
          }}
        >
          Formati supportati: Excel (.xlsx, .xls) e CSV (.csv)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          style={{ display: 'none' }}
        />
      </div>

      {/* Message Alert */}
      {message && (
        <div
          style={{
            marginBottom: '2rem',
            padding: '1rem',
            borderRadius: '12px',
            border: `1px solid ${
              messageType === 'success'
                ? '#86efac'
                : messageType === 'error'
                  ? '#fecaca'
                  : '#93c5fd'
            }`,
            backgroundColor:
              messageType === 'success'
                ? '#f0fdf4'
                : messageType === 'error'
                  ? '#fef2f2'
                  : '#eff6ff',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}
        >
          {messageType === 'success' ? (
            <CheckCircle
              size={20}
              style={{
                color: '#16a34a',
                flexShrink: 0,
                marginTop: '2px',
              }}
            />
          ) : messageType === 'error' ? (
            <AlertCircle
              size={20}
              style={{
                color: '#dc2626',
                flexShrink: 0,
                marginTop: '2px',
              }}
            />
          ) : (
            <FileSpreadsheet
              size={20}
              style={{
                color: '#2563eb',
                flexShrink: 0,
                marginTop: '2px',
              }}
            />
          )}
          <div>
            <p
              style={{
                fontWeight: 600,
                color:
                  messageType === 'success'
                    ? '#166534'
                    : messageType === 'error'
                      ? '#991b1b'
                      : '#1e40af',
                marginBottom: '2px',
              }}
            >
              {messageType === 'success' ? 'Successo' : messageType === 'error' ? 'Errore' : 'Informazione'}
            </p>
            <p
              style={{
                fontSize: '0.9rem',
                color:
                  messageType === 'success'
                    ? '#166534'
                    : messageType === 'error'
                      ? '#991b1b'
                      : '#1e40af',
              }}
            >
              {message}
            </p>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {preview.length > 0 && (
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: '#1e293b',
                margin: 0,
              }}
            >
              Anteprima Importazione ({preview.length} transazioni)
            </h3>
          </div>

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
                  {['Data', 'Descrizione', 'Categoria', 'Persona', 'Importo'].map((header) => (
                    <th
                      key={header}
                      style={{
                        padding: '12px 16px',
                        textAlign: header === 'Importo' ? 'right' : 'left',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        letterSpacing: '0.05em',
                        fontWeight: 600,
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((tx, idx) => (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#f8f9fa' : 'white',
                      borderBottom: '1px solid #e2e8f0',
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
                        color: '#64748b',
                        fontSize: '0.85rem',
                      }}
                    >
                      {tx.macroCategoria}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        color: '#1e293b',
                      }}
                    >
                      {tx.persona}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {preview.length > 10 && (
            <div
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #e2e8f0',
                fontSize: '0.9rem',
                color: '#64748b',
              }}
            >
              ... e {preview.length - 10} altre transazioni
            </div>
          )}

          <div
            style={{
              padding: '1.5rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleImport}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#5568d3';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#667eea';
              }}
            >
              {loading ? 'Importazione in corso...' : `Importa ${preview.length} transazioni`}
            </button>

            <button
              onClick={() => {
                setPreview([]);
                setFilename('');
                setMessage('');
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#f1f5f9',
                color: '#667eea',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
              }}
            >
              Annulla
            </button>
          </div>
        </div>
      )}

      {/* Import History */}
      {imports && imports.length > 0 && (
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: '#1e293b',
                margin: 0,
              }}
            >
              Storico Importazioni
            </h3>
          </div>

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
                  {['Data', 'File', 'Fonte', 'Transazioni', 'Azioni'].map((header) => (
                    <th
                      key={header}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        letterSpacing: '0.05em',
                        fontWeight: 600,
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...imports].reverse().map((imp) => (
                  <tr
                    key={imp.id}
                    style={{
                      backgroundColor: imp.id! % 2 === 0 ? '#f8f9fa' : 'white',
                      borderBottom: '1px solid #e2e8f0',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = imp.id! % 2 === 0 ? '#f8f9fa' : 'white';
                    }}
                  >
                    <td
                      style={{
                        padding: '12px 16px',
                        color: '#1e293b',
                        fontWeight: 500,
                      }}
                    >
                      {new Date(imp.importedAt).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}{' '}
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        {new Date(imp.importedAt).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        color: '#64748b',
                        fontSize: '0.85rem',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {imp.filename}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        color: '#1e293b',
                        fontWeight: 500,
                      }}
                    >
                      {imp.fonte}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                        color: '#1e293b',
                        fontWeight: 600,
                      }}
                    >
                      {imp.transactionCount}
                    </td>
                    <td
                      style={{
                        padding: '12px 16px',
                      }}
                    >
                      <button
                        onClick={() => handleDeleteImport(imp.id!)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'transparent',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fee2e2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Elimina importazione"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
