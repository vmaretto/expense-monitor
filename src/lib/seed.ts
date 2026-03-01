import { db, type Transaction } from './db';
import { DEFAULT_THRESHOLDS } from './constants';

export async function seedDatabase() {
  const count = await db.transactions.count();

  // Only seed if database is empty - load from JSON file
  if (count === 0) {
    try {
      const response = await fetch('/seed-data.json');
      if (response.ok) {
        const data: Transaction[] = await response.json();
        if (data.length > 0) {
          await db.transactions.bulkAdd(data);
          console.log(`Seeded ${data.length} transactions from seed-data.json`);
        }
      }
    } catch (e) {
      console.warn('No seed data found, starting with empty database');
    }
  }

  // Always set up default thresholds if not present
  const thresholdCount = await db.alertThresholds.count();
  if (thresholdCount === 0) {
    await db.alertThresholds.bulkAdd(DEFAULT_THRESHOLDS);
  }
}

export async function importTransactions(transactions: Transaction[]) {
  const result = await db.transactions.bulkAdd(transactions);
  return result;
}

export async function exportTransactions() {
  const transactions = await db.transactions.toArray();
  return JSON.stringify(transactions, null, 2);
}

export async function clearDatabase() {
  await db.transactions.clear();
  await db.alertThresholds.clear();
  await db.imports.clear();
}
