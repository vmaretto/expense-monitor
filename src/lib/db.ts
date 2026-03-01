import Dexie, { type Table } from 'dexie';

export interface Transaction {
  id?: number;
  data: string;        // ISO date
  dataStr: string;     // Display date dd/mm/yyyy
  descrizione: string;
  dettaglio: string;
  importo: number;
  macroCategoria: string;
  persona: string;
  note: string;
  fonte: string;       // Intesa, BNL, PayPal, Carta Gigi
  mese: string;        // YYYY-MM
}

export interface AlertThreshold {
  id?: number;
  categoria: string;
  monthlyLimit: number;
  isActive: boolean;
}

export interface ImportRecord {
  id?: number;
  filename: string;
  fonte: string;
  transactionCount: number;
  importedAt: string;
}

class ExpenseDB extends Dexie {
  transactions!: Table<Transaction>;
  alertThresholds!: Table<AlertThreshold>;
  imports!: Table<ImportRecord>;

  constructor() {
    super('ExpenseMonitor');
    this.version(1).stores({
      transactions: '++id, data, mese, persona, macroCategoria, fonte',
      alertThresholds: '++id, &categoria',
      imports: '++id, filename',
    });
  }
}

export const db = new ExpenseDB();
