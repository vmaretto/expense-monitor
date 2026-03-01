import type { Transaction } from './db';

export function classifyTransaction(tx: Partial<Transaction>): { persona: string; categoria: string } {
  let persona = tx.persona || 'Virgilio'; // Default
  let categoria = tx.macroCategoria || 'Acquisto Vario'; // Default

  const noteNorm = (tx.note || '').toLowerCase();
  const descNorm = (tx.descrizione || '').toLowerCase();

  // Rule 1: Note contains "da dividere"
  if (noteNorm.includes('da dividere')) {
    persona = 'Da Dividere';
    return { persona, categoria };
  }

  // Rule 2: Note contains "addebitare a luisa" or "per luisa" or "luisa.*rimborso"
  if (
    noteNorm.includes('addebitare a luisa') ||
    noteNorm.includes('per luisa') ||
    /luisa.*rimborso|rimborso.*luisa/.test(noteNorm)
  ) {
    persona = 'Moglie';
    return { persona, categoria };
  }

  // Rule 3: Note contains "- virgilio" or "– virgilio"
  if (noteNorm.includes('- virgilio') || noteNorm.includes('– virgilio')) {
    persona = 'Virgilio';
    return { persona, categoria };
  }

  // Rule 4: Note contains "luisa" (alone, not with virgilio)
  if (noteNorm.includes('luisa') && !noteNorm.includes('virgilio')) {
    persona = 'Moglie';
    return { persona, categoria };
  }

  // Rule 5: Note contains "moglie"
  if (noteNorm.includes('moglie')) {
    persona = 'Moglie';
    return { persona, categoria };
  }

  // Rule 6: Note contains "posti" → categoria = "Spese Lavoro", persona = "Virgilio"
  if (noteNorm.includes('posti')) {
    categoria = 'Spese Lavoro';
    persona = 'Virgilio';
    return { persona, categoria };
  }

  // Rule 7: Note contains "santa severa"
  if (noteNorm.includes('santa severa')) {
    categoria = 'Casa Santa Severa';
    return { persona, categoria };
  }

  // Rule 8: Note contains "settimana bianca"
  if (noteNorm.includes('settimana bianca')) {
    categoria = 'Settimana Bianca';
    persona = 'Da Dividere';
    return { persona, categoria };
  }

  // Rule 9: Note contains "compleanno gigi" + "dividere"
  if (noteNorm.includes('compleanno gigi') && noteNorm.includes('dividere')) {
    categoria = 'Viaggio Compleanno Gigi';
    persona = 'Da Dividere';
    return { persona, categoria };
  }

  // Rule 10: Description contains "garage"
  if (descNorm.includes('garage')) {
    categoria = 'Box Auto/Parcheggio';
    return { persona, categoria };
  }

  // Rule 11: Description contains "commissioni" or "costo bonifico"
  if (descNorm.includes('commissioni') || descNorm.includes('costo bonifico')) {
    categoria = 'Commissioni Bancarie';
    persona = 'Virgilio';
    return { persona, categoria };
  }

  // Rule 12: Fonte = "Carta Gigi"
  if (tx.fonte === 'Carta Gigi') {
    persona = 'Figlio';
  }

  return { persona, categoria };
}
