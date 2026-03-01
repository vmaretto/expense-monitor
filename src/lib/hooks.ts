'use client';

import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Transaction } from './db';

export interface TransactionFilters {
  dateRange?: [string, string]; // [startDate, endDate] in YYYY-MM-DD format
  persona?: string;
  categoria?: string;
  fonte?: string;
  searchText?: string;
}

function applyFilters(transactions: Transaction[], filters: TransactionFilters) {
  let result = transactions;

  if (filters.dateRange) {
    const [start, end] = filters.dateRange;
    result = result.filter(tx => tx.data >= start && tx.data <= end);
  }

  if (filters.persona) {
    result = result.filter(tx => tx.persona === filters.persona);
  }

  if (filters.categoria) {
    result = result.filter(tx => tx.macroCategoria === filters.categoria);
  }

  if (filters.fonte) {
    result = result.filter(tx => tx.fonte === filters.fonte);
  }

  if (filters.searchText) {
    const search = filters.searchText.toLowerCase();
    result = result.filter(
      tx =>
        tx.descrizione.toLowerCase().includes(search) ||
        tx.dettaglio.toLowerCase().includes(search) ||
        tx.note.toLowerCase().includes(search)
    );
  }

  return result;
}

export function useTransactions(filters?: TransactionFilters) {
  const allTransactions = useLiveQuery(() => db.transactions.toArray());

  return useMemo(() => {
    if (!allTransactions) return [];
    return applyFilters(allTransactions, filters || {});
  }, [allTransactions, filters]);
}

export function useStats(filters?: TransactionFilters) {
  const transactions = useTransactions(filters);

  return useMemo(() => {
    const entrate = transactions
      .filter(tx => tx.importo > 0)
      .reduce((sum, tx) => sum + tx.importo, 0);

    const uscite = transactions
      .filter(tx => tx.importo < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.importo), 0);

    return {
      totaleEntrate: entrate,
      totaleUscite: uscite,
      saldo: entrate - uscite,
      count: transactions.length,
    };
  }, [transactions]);
}

export function useMonthlyData(filters?: TransactionFilters) {
  const transactions = useTransactions(filters);

  return useMemo(() => {
    const monthly: Record<string, { entrate: number; uscite: number }> = {};

    transactions.forEach(tx => {
      if (!monthly[tx.mese]) {
        monthly[tx.mese] = { entrate: 0, uscite: 0 };
      }
      if (tx.importo > 0) {
        monthly[tx.mese].entrate += tx.importo;
      } else {
        monthly[tx.mese].uscite += Math.abs(tx.importo);
      }
    });

    return Object.entries(monthly)
      .map(([mese, data]) => ({
        mese,
        ...data,
      }))
      .sort((a, b) => a.mese.localeCompare(b.mese));
  }, [transactions]);
}

export function usePersonaData(filters?: TransactionFilters) {
  const transactions = useTransactions(filters);

  return useMemo(() => {
    const byPersona: Record<string, number> = {};

    // Only expenses (negative amounts), exclude "Entrata"
    transactions.forEach(tx => {
      if (tx.importo < 0 && tx.persona !== 'Entrata') {
        if (!byPersona[tx.persona]) {
          byPersona[tx.persona] = 0;
        }
        byPersona[tx.persona] += Math.abs(tx.importo);
      }
    });

    return Object.entries(byPersona)
      .map(([persona, total]) => ({
        persona,
        total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);
}

export function useCategoryData(filters?: TransactionFilters) {
  const transactions = useTransactions(filters);

  return useMemo(() => {
    const byCategory: Record<string, { total: number; count: number }> = {};

    // Only expenses (negative amounts)
    transactions.forEach(tx => {
      if (tx.importo < 0) {
        if (!byCategory[tx.macroCategoria]) {
          byCategory[tx.macroCategoria] = { total: 0, count: 0 };
        }
        byCategory[tx.macroCategoria].total += Math.abs(tx.importo);
        byCategory[tx.macroCategoria].count += 1;
      }
    });

    return Object.entries(byCategory)
      .map(([categoria, data]) => ({
        categoria,
        ...data,
      }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);
}

export function useAlerts() {
  const thresholds = useLiveQuery(() => db.alertThresholds.filter(t => t.isActive).toArray());
  const transactions = useLiveQuery(() => db.transactions.toArray());

  return useMemo(() => {
    if (!thresholds || !transactions) return [];

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const alerts: { categoria: string; spent: number; limit: number; exceeded: boolean }[] = [];

    thresholds.forEach(threshold => {
      const spent = transactions
        .filter(tx => tx.mese === currentMonth && tx.macroCategoria === threshold.categoria && tx.importo < 0)
        .reduce((sum, tx) => sum + Math.abs(tx.importo), 0);

      if (spent > threshold.monthlyLimit) {
        alerts.push({
          categoria: threshold.categoria,
          spent,
          limit: threshold.monthlyLimit,
          exceeded: true,
        });
      }
    });

    return alerts;
  }, [thresholds, transactions]);
}

export function useUpdateTransaction() {
  return async (id: number, updates: Partial<Transaction>) => {
    await db.transactions.update(id, updates);
  };
}
