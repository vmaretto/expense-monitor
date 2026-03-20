/**
 * Smart parsers for different bank statement formats
 */

export interface ParsedRow {
  data: string;       // ISO date YYYY-MM-DD
  descrizione: string;
  dettaglio: string;
  importo: number;
}

/**
 * Normalize column name for matching
 */
function normalizeCol(col: string): string {
  return col?.toString().toLowerCase().trim().replace(/\s+/g, ' ') || '';
}

/**
 * Find value in row by possible column names (case-insensitive)
 */
function findValue(row: Record<string, unknown>, ...possibleNames: string[]): unknown {
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = normalizeCol(key);
    for (const name of possibleNames) {
      if (normalizedKey === normalizeCol(name) || normalizedKey.includes(normalizeCol(name))) {
        return value;
      }
    }
  }
  return undefined;
}

/**
 * Parse amount string to number
 * Handles: "1.234,56" (IT), "1,234.56" (US), "-1234.56", etc.
 */
export function parseAmount(value: unknown): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  let str = value.toString().trim();
  
  // Remove currency symbols and spaces
  str = str.replace(/[€$£\s]/g, '');
  
  // Detect Italian format (1.234,56) vs US format (1,234.56)
  const lastComma = str.lastIndexOf(',');
  const lastDot = str.lastIndexOf('.');
  
  if (lastComma > lastDot) {
    // Italian format: 1.234,56 -> 1234.56
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma) {
    // US format: 1,234.56 -> 1234.56
    str = str.replace(/,/g, '');
  } else if (lastComma !== -1) {
    // Only comma: 1234,56 -> 1234.56
    str = str.replace(',', '.');
  }
  
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Parse date string to ISO format YYYY-MM-DD
 * Handles: "12/03/2026", "2026-03-12", "12/3/2026", Excel serial dates
 */
export function parseDate(value: unknown): string {
  if (!value) return new Date().toISOString().split('T')[0];
  
  // Excel serial date (number of days since 1900-01-01)
  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    return date.toISOString().split('T')[0];
  }
  
  const str = value.toString().trim();
  
  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }
  
  // Try to parse Date object string
  if (str.includes('T') || str.includes('00:00:00')) {
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  
  // Italian format: DD/MM/YYYY or D/M/YYYY
  const itMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (itMatch) {
    const [, day, month, year] = itMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // US format: MM/DD/YYYY (less common in Italy, but handle it)
  const usMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (usMatch) {
    const [, year, month, day] = usMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return new Date().toISOString().split('T')[0];
}

/**
 * Detect format and find header row in raw data
 * Returns skipRows count and detected format
 */
export function detectFormat(rows: Record<string, unknown>[]): { 
  skipRows: number; 
  format: 'paypal' | 'intesa_cc' | 'intesa_carta' | 'intesa_xme' | 'generic';
  headers: string[];
} {
  // Check each row for header patterns
  for (let i = 0; i < Math.min(rows.length, 25); i++) {
    const row = rows[i];
    const values = Object.values(row).map(v => normalizeCol(v?.toString() || ''));
    const combined = values.join(' ');
    
    // PayPal CSV
    if (combined.includes('codice ricevuta') || combined.includes('codice transazione')) {
      return { skipRows: i, format: 'paypal', headers: Object.keys(row) };
    }
    
    // Intesa CC (BNL conto)
    if (combined.includes('data contabile') && combined.includes('data valuta')) {
      return { skipRows: i, format: 'intesa_cc', headers: Object.keys(row) };
    }
    
    // Intesa Carta Prepagata
    if (combined.includes('data movimento') && combined.includes('data contabile')) {
      return { skipRows: i, format: 'intesa_carta', headers: Object.keys(row) };
    }
    
    // Intesa XME
    if (combined.includes('operazione') && combined.includes('conto o carta')) {
      return { skipRows: i, format: 'intesa_xme', headers: Object.keys(row) };
    }
    
    // Generic: has "data" and "importo" columns
    if (combined.includes('data') && combined.includes('importo')) {
      return { skipRows: i, format: 'generic', headers: Object.keys(row) };
    }
  }
  
  return { skipRows: 0, format: 'generic', headers: [] };
}

/**
 * Parse a row based on detected format
 */
export function parseRow(row: Record<string, unknown>, format: string): ParsedRow | null {
  let data: string;
  let descrizione: string;
  let dettaglio: string;
  let importo: number;
  
  switch (format) {
    case 'paypal':
      data = parseDate(findValue(row, 'data', 'date'));
      descrizione = (findValue(row, 'nome', 'name') || findValue(row, 'tipo', 'type') || '').toString();
      dettaglio = (findValue(row, 'descrizione', 'description') || '').toString();
      importo = parseAmount(findValue(row, 'importo', 'amount', 'totale', 'total'));
      break;
      
    case 'intesa_cc':
      data = parseDate(findValue(row, 'data contabile', 'data valuta', 'data'));
      descrizione = (findValue(row, 'descrizione') || '').toString();
      dettaglio = (findValue(row, 'dettaglio') || '').toString();
      importo = parseAmount(findValue(row, 'importo'));
      break;
      
    case 'intesa_carta':
      data = parseDate(findValue(row, 'data movimento', 'data contabile', 'data'));
      descrizione = (findValue(row, 'descrizione') || '').toString();
      dettaglio = '';
      importo = parseAmount(findValue(row, 'importo'));
      break;
      
    case 'intesa_xme':
      data = parseDate(findValue(row, 'data'));
      descrizione = (findValue(row, 'operazione') || '').toString();
      dettaglio = (findValue(row, 'dettagli', 'dettaglio') || '').toString();
      importo = parseAmount(findValue(row, 'importo'));
      break;
      
    default: // generic
      data = parseDate(
        findValue(row, 'data', 'date', 'data contabile', 'data movimento', 'datastr')
      );
      descrizione = (
        findValue(row, 'descrizione', 'description', 'nome', 'name', 'operazione') || ''
      ).toString();
      dettaglio = (
        findValue(row, 'dettaglio', 'dettagli', 'details', 'note') || ''
      ).toString();
      importo = parseAmount(
        findValue(row, 'importo', 'amount', 'totale', 'total', 'valore', 'value')
      );
  }
  
  // Skip empty rows or header-like rows
  if (!data || data === 'Invalid Date' || importo === 0 && !descrizione) {
    return null;
  }
  
  // Skip if descrizione looks like a header
  if (normalizeCol(descrizione).includes('descrizione') || normalizeCol(descrizione).includes('operazione')) {
    return null;
  }
  
  return { data, descrizione, dettaglio, importo };
}

/**
 * Smart parse for Excel data using XLSX sheet_to_json output
 * Auto-detects format and skips header rows
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function smartParseExcel(
  workbook: { SheetNames: string[]; Sheets: Record<string, unknown> },
  XLSX: any
): ParsedRow[] {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // First pass: read raw to detect format
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false }) as unknown[][];
  
  // Find header row by looking for common column names
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(rawRows.length, 25); i++) {
    const row = rawRows[i];
    if (!Array.isArray(row)) continue;
    
    const combined = row.map(v => normalizeCol(v?.toString() || '')).join(' ');
    if (
      (combined.includes('data') && combined.includes('importo')) ||
      (combined.includes('data contabile')) ||
      (combined.includes('data movimento')) ||
      (combined.includes('operazione') && combined.includes('importo'))
    ) {
      headerRowIndex = i;
      break;
    }
  }
  
  // Second pass: read with detected header row
  const rows = XLSX.utils.sheet_to_json(sheet, { raw: false }) as Record<string, unknown>[];
  
  // If headers weren't in first row, we need to manually skip and remap
  let dataRows: Record<string, unknown>[];
  let format: string;
  
  if (headerRowIndex > 0) {
    // Build header names from the detected header row
    const headerRow = rawRows[headerRowIndex] as string[];
    dataRows = [];
    
    for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
      const valueRow = rawRows[i] as unknown[];
      if (!valueRow || !valueRow.length) continue;
      
      const rowObj: Record<string, unknown> = {};
      headerRow.forEach((header, idx) => {
        if (header && valueRow[idx] !== undefined) {
          rowObj[header.toString()] = valueRow[idx];
        }
      });
      
      if (Object.keys(rowObj).length > 0) {
        dataRows.push(rowObj);
      }
    }
    
    // Detect format from first data row
    const detection = detectFormat([dataRows[0] || {}]);
    format = detection.format;
  } else {
    dataRows = rows;
    const detection = detectFormat(dataRows);
    format = detection.format;
  }
  
  // Parse all rows
  const results: ParsedRow[] = [];
  for (const row of dataRows) {
    const parsed = parseRow(row, format);
    if (parsed && parsed.importo !== 0) {
      results.push(parsed);
    }
  }
  
  return results;
}

/**
 * Smart parse for CSV data using PapaParse output
 */
export function smartParseCSV(rows: Record<string, unknown>[]): ParsedRow[] {
  if (!rows.length) return [];
  
  const detection = detectFormat(rows);
  const format = detection.format;
  
  const results: ParsedRow[] = [];
  
  // Skip header rows if needed
  const startIndex = detection.skipRows > 0 ? detection.skipRows + 1 : 0;
  
  for (let i = startIndex; i < rows.length; i++) {
    const parsed = parseRow(rows[i], format);
    if (parsed && parsed.importo !== 0) {
      results.push(parsed);
    }
  }
  
  return results;
}
